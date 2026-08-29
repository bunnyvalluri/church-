/**
 * frontend/lib/authEmailService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Kingdom of Christ Ministries (KCM) — Transactional Auth Email Bridge
 *
 * Consolidated facade that routes authentication transactional emails directly
 * through the unified, environment-aware EmailService architecture.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { emailService } from '@/lib/email';
import { renderEmailTemplate } from '@/lib/email/email.templates';
import { emailConfig } from '@/lib/email/email.config';
import { logger } from '@/lib/logger';

// ── Idempotency Deduplication Window (3 minutes per user/email) ───────────────
interface CacheEntry {
  timestamp: number;
  eventId?: string;
}

const sentEmailCache = new Map<string, CacheEntry>();
const DEDUPLICATION_TTL_MS = emailConfig.reliability.deduplicationTtlMs;

function cleanupCache() {
  const now = Date.now();
  for (const [key, entry] of sentEmailCache.entries()) {
    if (now - entry.timestamp > DEDUPLICATION_TTL_MS) {
      sentEmailCache.delete(key);
    }
  }
}

/**
 * Checks if a login email was recently sent for this user or event.
 * If not, registers the key in the idempotency cache.
 */
export function shouldSendLoginEmail(userKey: string, eventId?: string): boolean {
  cleanupCache();
  const normalizedKey = userKey.toLowerCase().trim();
  const existing = sentEmailCache.get(normalizedKey);

  const now = Date.now();
  if (existing) {
    if (eventId && existing.eventId === eventId) {
      return false; // Duplicate event ID
    }
    if (now - existing.timestamp < DEDUPLICATION_TTL_MS) {
      return false; // Within deduplication window
    }
  }

  sentEmailCache.set(normalizedKey, { timestamp: now, eventId });
  return true;
}

// ── Format Date & Time for Login Activity (IST / Localized) ───────────────────
export function getFormattedLoginDateTime(): string {
  try {
    return (
      new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) + ' IST'
    );
  } catch {
    return new Date().toUTCString();
  }
}

// ── Email Template Parameters ────────────────────────────────────────────────
export interface GoogleLoginEmailParams {
  firstName: string;
  email: string;
  loginDateTime?: string;
  loginMethod?: string;
  memberPortalUrl?: string;
  sandboxNotice?: string;
}

/**
 * Generates an email-client compatible (Gmail, Outlook, Apple Mail, Samsung Email)
 * responsive HTML email for KCM Google Sign-In confirmation.
 */
export function generateGoogleLoginEmailHtml({
  firstName,
  email,
  loginDateTime = getFormattedLoginDateTime(),
  loginMethod = 'Google Sign-In',
  memberPortalUrl,
}: GoogleLoginEmailParams): string {
  const rendered = renderEmailTemplate('LOGIN_ALERT', {
    email,
    firstName,
    loginDateTime,
    loginMethod,
    reviewActivityUrl: memberPortalUrl,
  });
  return rendered.html;
}

/**
 * Generates plain-text alternative for Google login notifications.
 */
export function generateGoogleLoginEmailText({
  firstName,
  email,
  loginDateTime = getFormattedLoginDateTime(),
  memberPortalUrl = emailConfig.church.portalUrl,
  supportEmail = emailConfig.church.supportEmail,
}: {
  firstName: string;
  email: string;
  loginDateTime?: string;
  memberPortalUrl?: string;
  supportEmail?: string;
}): string {
  const rendered = renderEmailTemplate('LOGIN_ALERT', {
    email,
    firstName,
    loginDateTime,
    reviewActivityUrl: memberPortalUrl,
  });
  return rendered.text;
}

/**
 * Dispatches the branded KCM Google login confirmation email to the user.
 * Delegates to centralized EmailService for multi-transport delivery,
 * environment-aware routing, and database audit logging.
 */
export async function sendGoogleLoginConfirmationEmail({
  userId,
  email,
  name,
  eventId,
  loginMethod = 'Google Sign-In',
}: {
  userId: string;
  email: string;
  name?: string | null;
  eventId?: string;
  loginMethod?: string;
}): Promise<{ sent: boolean; reason?: string; transport?: string }> {
  const sanitizedEmail = (email || '').toLowerCase().trim();
  if (!sanitizedEmail) {
    logger.warn('[EMAIL/AUTH] Skipped login email: Missing recipient email address', {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_FAILED',
      userId,
    });
    return { sent: false, reason: 'MISSING_EMAIL' };
  }

  // 1. Idempotency Check: Prevent duplicate sends for the same user within TTL
  const deduplicationKey = `${userId || sanitizedEmail}:google-login`;
  if (!shouldSendLoginEmail(deduplicationKey, eventId)) {
    logger.info('[EMAIL/AUTH] Skipped duplicate login email (deduplicated by idempotency guard)', {
      component: 'authEmailService',
      action: 'LOGIN_EMAIL_DEDUPLICATED',
      userId,
      email: sanitizedEmail,
    });
    return { sent: false, reason: 'DEDUPLICATED' };
  }

  const loginDateTime = getFormattedLoginDateTime();

  try {
    const result = await emailService.sendLoginNotification(
      sanitizedEmail,
      name,
      {
        loginDateTime,
        loginMethod,
      },
      userId
    );

    return {
      sent: result.success,
      transport: result.provider,
      reason: result.error,
    };
  } catch (err: any) {
    logger.error('[EMAIL/AUTH] Exception during login email dispatch:', {
      error: err?.message || err,
    });
    return { sent: false, reason: err?.message || 'DISPATCH_ERROR' };
  }
}
