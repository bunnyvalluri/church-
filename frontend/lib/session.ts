/**
 * frontend/lib/session.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-Ready Dual-Layer Session Architecture for KCM Ministries.
 *
 * Security Features:
 *  1. Cryptographically unguessable 32-byte session secrets.
 *  2. Raw session tokens are NEVER stored in the database — only SHA-256 hashes.
 *  3. Cryptographic HMAC-SHA256 signature for 0ms tamper-proof Edge verification.
 *  4. Authoritative PostgreSQL session tracking with instant revocation & TTL.
 *  5. Asynchronous telemetry logging to MongoDB Atlas (non-blocking).
 *  6. HttpOnly=true, Secure=true (in prod), SameSite=Lax, Path=/ cookies.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/prisma/generated/client';

export const SESSION_COOKIE_NAME = 'kcm_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Resolve secret key from environment
export function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'kcm-church-portal-secure-session-auth-key-2026';
  return secret;
}

// ── Anonymized Hashes for Security Forensics ─────────────────────────────────
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip.trim()).digest('hex');
}

export function hashUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  return crypto.createHash('sha256').update(ua.trim()).digest('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── HMAC Signature Generation & Verification ─────────────────────────────────
export function signPayload(payload: string): string {
  const secret = getSessionSecret();
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function verifyHmacSignature(payload: string, signature: string): boolean {
  const expected = signPayload(payload);
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ── Types ───────────────────────────────────────────────────────────────────
export interface SessionUser {
  uid: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  sessionId: string;
}

export interface SessionCreationOptions {
  ip?: string | null;
  userAgent?: string | null;
  isHttps?: boolean;
}

// ── Asynchronous Telemetry to MongoDB Atlas (Non-Blocking) ───────────────────
async function logSessionTelemetry(
  action: 'SESSION_CREATED' | 'SESSION_REVOKED' | 'SESSION_EXPIRED',
  actorId: string,
  actorRole: string,
  ipHash?: string | null,
  metadata?: Record<string, any>
) {
  try {
    const { getMongoDb } = await import('@/lib/mongodb/client');
    const db = await getMongoDb();
    if (!db) return;

    db.collection('audit_events').insertOne({
      eventId: `sess_evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      actorId,
      actorRole,
      action,
      resource: 'session',
      metadata: metadata || {},
      ipHash: ipHash || null,
      createdAt: new Date(),
    }).catch(() => {});
  } catch {
    // Graceful degradation: never block application operations if MongoDB is offline
  }
}

// ── Session Creation ─────────────────────────────────────────────────────────
/**
 * Creates a server-side session in PostgreSQL, hashes the token,
 * signs the cookie payload, and returns the signed token.
 */
export async function createServerSession(
  userId: string,
  role: UserRole,
  options: SessionCreationOptions = {}
): Promise<{ token: string; expiresAt: Date; sessionId: string }> {
  // 1. Generate 32-byte cryptographically secure random raw token
  const rawSecret = crypto.randomBytes(32).toString('hex');
  const sessionTokenHash = hashSessionToken(rawSecret);

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const ipHash = hashIp(options.ip);
  const userAgentHash = hashUserAgent(options.userAgent);

  // 2. Persist to PostgreSQL `Session` model
  const session = await prisma.session.create({
    data: {
      userId,
      sessionTokenHash,
      role,
      expiresAt,
      ipHash,
      userAgentHash,
    },
    select: { id: true, userId: true, role: true, expiresAt: true },
  });

  // 3. Assemble signed token: `${sessionId}.${rawSecret}.${role}.${expiresAtMs}.${signature}`
  const expiresAtMs = expiresAt.getTime();
  const signaturePayload = `${session.id}.${rawSecret}.${role}.${expiresAtMs}`;
  const signature = signPayload(signaturePayload);
  const token = `${signaturePayload}.${signature}`;

  // 4. Async MongoDB logging
  logSessionTelemetry('SESSION_CREATED', userId, role, ipHash, { sessionId: session.id });

  return {
    token,
    expiresAt,
    sessionId: session.id,
  };
}

// ── Session Verification (Server-Side with Database Lookup) ──────────────────
/**
 * Verifies the signed session cookie against PostgreSQL.
 * Ensures the session has not been revoked, has not expired,
 * and syncs latest role from the user record.
 */
export async function verifyServerSession(tokenString: string | null | undefined): Promise<SessionUser | null> {
  if (!tokenString || typeof tokenString !== 'string') return null;

  const parts = tokenString.split('.');
  if (parts.length !== 5) return null;

  const [sessionId, rawSecret, role, expiresAtMsStr, signature] = parts;
  const signaturePayload = `${sessionId}.${rawSecret}.${role}.${expiresAtMsStr}`;

  // 1. Verify HMAC signature
  if (!verifyHmacSignature(signaturePayload, signature)) {
    return null;
  }

  // 2. Verify expiration timestamp
  const expiresAtMs = parseInt(expiresAtMsStr, 10);
  if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
    return null;
  }

  // 3. Verify in PostgreSQL database
  try {
    const sessionTokenHash = hashSessionToken(rawSecret);
    const dbSession = await prisma.session.findUnique({
      where: { sessionTokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    if (!dbSession) return null;

    // Check revocation
    if (dbSession.revokedAt) return null;

    // Check DB expiration
    if (dbSession.expiresAt.getTime() <= Date.now()) return null;

    // Check user exists
    if (!dbSession.user) return null;

    const user = dbSession.user;

    // Authoritative role check: sync if user's role changed in DB
    if (dbSession.role !== user.role) {
      prisma.session.update({
        where: { id: dbSession.id },
        data: { role: user.role },
      }).catch(() => {});
    }

    // Sliding activity window update (once every 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (dbSession.lastActivityAt < fifteenMinutesAgo) {
      prisma.session.update({
        where: { id: dbSession.id },
        data: { lastActivityAt: new Date() },
      }).catch(() => {});
    }

    return {
      uid: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      sessionId: dbSession.id,
    };
  } catch (err) {
    console.error('[SESSION] Verification database error:', err);
    return null;
  }
}

// ── Session Revocation ───────────────────────────────────────────────────────
/**
 * Invalidates a single session by its ID.
 */
export async function revokeServerSession(sessionId: string): Promise<boolean> {
  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
      select: { id: true, userId: true, role: true },
    });

    logSessionTelemetry('SESSION_REVOKED', session.userId, session.role, null, { sessionId });
    return true;
  } catch (err) {
    console.warn('[SESSION] Session revocation error:', err);
    return false;
  }
}

/**
 * Invalidates all active sessions for a user (e.g. on password change or role modification).
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  try {
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    logSessionTelemetry('SESSION_REVOKED', userId, 'ALL', null, {
      revokedCount: result.count,
    });
    return result.count;
  } catch (err) {
    console.warn('[SESSION] Revoke all user sessions error:', err);
    return 0;
  }
}

// ── Cookie Management Helpers ────────────────────────────────────────────────
/**
 * Attaches the secure session cookie to a NextResponse.
 */
export function attachSessionCookie(
  response: NextResponse,
  token: string,
  isHttps = process.env.NODE_ENV === 'production'
): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie on logout or invalid session.
 */
export function removeSessionCookie(
  response: NextResponse,
  isHttps = process.env.NODE_ENV === 'production'
): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 0,
  });

  // Also purge deprecated client-side presence cookies
  response.cookies.set('__kcm_session_uid', '', { path: '/', maxAge: 0 });
  response.cookies.set('__kcm_session_role', '', { path: '/', maxAge: 0 });
}
