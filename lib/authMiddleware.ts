/**
 * lib/authMiddleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable server-side authentication & authorization middleware for
 * Next.js App Router API routes.
 *
 * Usage — protect an entire route:
 *   const auth = await requireAuth(req);
 *   if (auth instanceof NextResponse) return auth;   // 401/403 already sent
 *   // auth.uid, auth.email, auth.role are now available
 *
 * Usage — protect admin-only route:
 *   const auth = await requireAdmin(req);
 *   if (auth instanceof NextResponse) return auth;
 *
 * Usage — soft check (no automatic response):
 *   const token = await getTokenFromRequest(req);
 *   if (!token) { ... }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PASTOR' | 'MEMBER';
}

type AdminRole = 'SUPER_ADMIN' | 'ADMIN';
type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'PASTOR';

// ── Internal: Extract Bearer token from request ────────────────────────────────
function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader.startsWith('Bearer ') && authHeader.length > 7) {
    return authHeader.slice(7);
  }
  return null;
}

// ── Internal: Look up user role from DB ───────────────────────
async function resolveRole(uid: string, email: string): Promise<AuthenticatedUser['role']> {
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } })
    ?? await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (user) return user.role as AuthenticatedUser['role'];
  return 'MEMBER'; // Safest default
}

// ── Public: Soft token extraction (no auto-response) ──────────────────────────
/**
 * Extracts and verifies the Firebase ID token from the request.
 * Returns the authenticated user info or null if unauthenticated.
 * Does NOT send a response — the caller must handle the null case.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  const decoded = await verifyFirebaseToken(token);
  if (!decoded) return null;

  const role = await resolveRole(decoded.uid, decoded.email ?? '');

  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.name,
    role,
  };
}

// ── Public: Require any valid Firebase auth ────────────────────────────────────
/**
 * Returns AuthenticatedUser if the request carries a valid Firebase ID token.
 * Returns NextResponse(401) if unauthenticated.
 */
export async function requireAuth(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev User',
      role: 'SUPER_ADMIN',
    };
  }
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }
  return user;
}

// ── Public: Require ADMIN or SUPER_ADMIN role ─────────────────────────────────
/**
 * Returns AuthenticatedUser if the request is from an authenticated admin.
 * Returns NextResponse(401) if unauthenticated, NextResponse(403) if insufficient role.
 */
export async function requireAdmin(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Administrator',
      role: 'SUPER_ADMIN',
    };
  }
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  const adminRoles: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'];
  if (!adminRoles.includes(user.role as AdminRole)) {
    return NextResponse.json(
      { error: 'Access denied. Admin privileges required.' },
      { status: 403 }
    );
  }

  return user;
}

// ── Public: Require PASTOR, ADMIN, or SUPER_ADMIN role ────────────────────────
/**
 * Returns AuthenticatedUser if the request is from staff (pastor+).
 * Returns NextResponse(401/403) otherwise.
 */
export async function requireStaff(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Staff Member',
      role: 'SUPER_ADMIN',
    };
  }
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  const staffRoles: StaffRole[] = ['PASTOR', 'ADMIN', 'SUPER_ADMIN'];
  if (!staffRoles.includes(user.role as StaffRole)) {
    return NextResponse.json(
      { error: 'Access denied. Staff privileges required.' },
      { status: 403 }
    );
  }

  return user;
}

// ── Public: Dev bypass (NEVER use in production) ───────────────────────────────
/**
 * In development (when NEXT_PUBLIC_DEV_AUTO_LOGIN is set), bypasses Firebase
 * verification and returns a mock user with the given role.
 * In production, this always returns null.
 */
export function getDevBypassUser(): AuthenticatedUser | null {
  if (process.env.NODE_ENV === 'production') return null;

  const devRole = process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase();
  if (!devRole) return null;

  const roleMap: Record<string, AuthenticatedUser['role']> = {
    admin: 'ADMIN',
    super_admin: 'SUPER_ADMIN',
    pastor: 'PASTOR',
    member: 'MEMBER',
  };

  const role = roleMap[devRole];
  if (!role) return null;

  return {
    uid: 'dev_bypass_uid',
    email: 'dev@kcm.local',
    name: 'Dev User',
    role,
  };
}

/**
 * Same as requireAdmin but with dev bypass support for local development.
 */
export async function requireAdminOrDev(req: Request): Promise<AuthenticatedUser | NextResponse> {
  // Dev bypass — local dev only
  if (process.env.NODE_ENV !== 'production') {
    const devUser = getDevBypassUser();
    if (devUser && (devUser.role === 'ADMIN' || devUser.role === 'SUPER_ADMIN' || devUser.role === 'PASTOR')) {
      return devUser;
    }
    
    // Automatically bypass if Firebase Admin is not configured locally
    if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      return {
        uid: 'dev_bypass_uid',
        email: 'dev@kcm.local',
        name: 'Dev Administrator',
        role: 'SUPER_ADMIN',
      };
    }
  }
  return requireAdmin(req);
}
