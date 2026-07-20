/**
 * lib/paymentSecurity.ts — KCM Payment Security Middleware
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides structured security checks for every payment API route.
 *
 * Features:
 *  • Razorpay webhook IP allowlist (Razorpay known IPs)
 *  • Suspicious activity detection (burst fraud alerts)
 *  • Payment failure tracking with auto-block
 *  • Structured payment audit events
 *  • Security event broadcasting (admin alerts)
 */

import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLogger';
import { sanitizeAuditField, maskSensitive } from '@/lib/security';
import { isRateLimited } from '@/lib/rateLimit';

// ─── Razorpay Webhook Source IPs ──────────────────────────────────────────────
// From: https://razorpay.com/docs/webhooks/
const RAZORPAY_WEBHOOK_IPS = new Set([
  '35.154.236.0/24',  // Razorpay Production IPs (CIDR — simplified to prefix check)
  '13.127.194.0',
  '52.66.75.0',
  '65.2.0.0',
  '127.0.0.1',        // localhost (dev)
  '::1',              // localhost IPv6
]);

/** Basic check — in production, enforce Razorpay IP allowlist */
export function isAllowedWebhookSource(ip: string): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  // Simplified prefix matching — in production use a proper CIDR library
  for (const allowed of RAZORPAY_WEBHOOK_IPS) {
    if (ip === allowed || ip.startsWith(allowed.split('/')[0].split('.').slice(0, 3).join('.'))) {
      return true;
    }
  }
  return false;
}

// ─── Payment Failure Tracker (In-Memory, per-IP) ─────────────────────────────

interface FailureRecord {
  count: number;
  firstFailureAt: number;
  lastFailureAt: number;
  blocked: boolean;
}

const failureTracker = new Map<string, FailureRecord>();
const FAILURE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_FAILURES_BEFORE_BLOCK = 10;
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function recordPaymentFailure(ip: string): void {
  const now = Date.now();
  const existing = failureTracker.get(ip);

  if (!existing || now - existing.firstFailureAt > FAILURE_WINDOW_MS) {
    failureTracker.set(ip, {
      count: 1,
      firstFailureAt: now,
      lastFailureAt: now,
      blocked: false,
    });
    return;
  }

  existing.count += 1;
  existing.lastFailureAt = now;
  existing.blocked = existing.count >= MAX_FAILURES_BEFORE_BLOCK;
  failureTracker.set(ip, existing);

  if (existing.blocked) {
    console.error(`[PAYMENT_SECURITY] IP ${maskSensitive(ip, 6)} BLOCKED after ${existing.count} failures`);
    // Log fraud alert
    writeAuditLog({
      action: 'SECURITY_IP_AUTO_BLOCKED',
      details: `IP blocked after ${existing.count} payment failures in 30 min window`,
      ipAddress: ip,
    }).catch(() => {});
  }
}

export function isPaymentBlocked(ip: string): boolean {
  const record = failureTracker.get(ip);
  if (!record || !record.blocked) return false;

  // Unblock after block duration
  if (Date.now() - record.lastFailureAt > BLOCK_DURATION_MS) {
    failureTracker.delete(ip);
    return false;
  }
  return true;
}

export function clearPaymentFailures(ip: string): void {
  failureTracker.delete(ip);
}

// ─── Rate Limit Presets for Payment Routes ────────────────────────────────────

export const RATE_LIMITS = {
  CREATE_ORDER: { windowMs: 10 * 60 * 1000, maxRequests: 5 },     // 5 orders per 10 min per IP
  VERIFY_PAYMENT: { windowMs: 15 * 60 * 1000, maxRequests: 20 },  // 20 verifications per 15 min
  WEBHOOK: { windowMs: 60 * 1000, maxRequests: 60 },              // 60 webhook events per min (Razorpay burst)
  RECEIPT_PDF: { windowMs: 60 * 1000, maxRequests: 10 },          // 10 PDF downloads per min
} as const;

// ─── Payment Security Guard ───────────────────────────────────────────────────

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  statusCode?: number;
}

/**
 * Run all payment security checks for an incoming request.
 * Returns { allowed: false, reason, statusCode } if any check fails.
 */
export function runPaymentSecurityChecks(
  ip: string,
  routeKey: keyof typeof RATE_LIMITS
): SecurityCheckResult {
  // 1. Auto-block check
  if (isPaymentBlocked(ip)) {
    return {
      allowed: false,
      reason: 'Too many failed attempts. Your IP has been temporarily blocked.',
      statusCode: 429,
    };
  }

  // 2. Rate limiting
  const limitConfig = RATE_LIMITS[routeKey];
  if (isRateLimited(ip, limitConfig)) {
    return {
      allowed: false,
      reason: `Rate limit exceeded. Maximum ${limitConfig.maxRequests} requests per ${Math.floor(limitConfig.windowMs / 60000)} minutes.`,
      statusCode: 429,
    };
  }

  return { allowed: true };
}

// ─── Payment-Specific Audit Events ───────────────────────────────────────────

export type PaymentAuditEvent =
  | 'ORDER_CREATED'
  | 'ORDER_CREATION_FAILED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_VERIFY_FAILED'
  | 'PAYMENT_SIGNATURE_INVALID'
  | 'PAYMENT_AMOUNT_MISMATCH'
  | 'WEBHOOK_RECEIVED'
  | 'WEBHOOK_SIGNATURE_INVALID'
  | 'WEBHOOK_AMOUNT_MISMATCH'
  | 'WEBHOOK_REPLAY_PREVENTED'
  | 'WEBHOOK_PROCESSED'
  | 'WEBHOOK_DUPLICATE_SKIPPED'
  | 'SESSION_EXPIRED'
  | 'SESSION_NOT_FOUND'
  | 'FRAUD_SUSPECTED'
  | 'IP_RATE_LIMITED'
  | 'IP_BLOCKED';

export async function logPaymentEvent(
  event: PaymentAuditEvent,
  details: Record<string, unknown>,
  ip: string,
  userId?: string | null
): Promise<void> {
  const safeDetails = Object.entries(details)
    .map(([k, v]) => `${k}=${sanitizeAuditField(String(v ?? ''), 200)}`)
    .join(' | ');

  await writeAuditLog({
    userId,
    action: `PAYMENT_${event}`,
    details: safeDetails,
    ipAddress: ip,
  });
}

// ─── Duplicate Order Prevention ───────────────────────────────────────────────

/**
 * Check if a session already has a completed donation (idempotency guard).
 * Returns existing donation ID if duplicate detected.
 */
export async function checkDuplicateOrder(sessionId: string): Promise<string | null> {
  const session = await prisma.donationSession.findUnique({
    where: { id: sessionId },
    select: { status: true, donations: { select: { id: true }, take: 1 } },
  });

  if (session?.status === 'COMPLETED' && session.donations[0]) {
    return session.donations[0].id;
  }
  return null;
}

// ─── Webhook Idempotency Guard ────────────────────────────────────────────────

/**
 * Check if a webhook event has already been processed (replay prevention).
 * Uses a SHA-256 hash of orderId + paymentId as unique event ID.
 */
export async function isWebhookAlreadyProcessed(webhookEventId: string): Promise<boolean> {
  const existing = await prisma.paymentWebhook.findFirst({
    where: {
      webhookEventId,
      status: 'PROCESSED',
    },
    select: { id: true },
  });
  return !!existing;
}
