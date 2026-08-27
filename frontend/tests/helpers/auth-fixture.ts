/**
 * frontend/tests/helpers/auth-fixture.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cryptographic Test Authentication Fixture for Playwright.
 * Generates valid HMAC-SHA256 session tokens compatible with Next.js Edge Middleware
 * and the application's real dual-layer session architecture.
 *
 * Never uses hardcoded user credentials or bypasses middleware.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'crypto';
import { BrowserContext } from '@playwright/test';
import { UserRole } from '../config/routes';

export const SESSION_COOKIE_NAME = 'kcm_session';

/**
 * Resolves session signing secret from environment or test fallback.
 */
export function getTestSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'kcm-church-portal-secure-session-auth-key-2026'
  );
}

/**
 * Signs a payload with HMAC-SHA256 in base64url format.
 */
export function signTestPayload(payload: string): string {
  const secret = getTestSessionSecret();
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

/**
 * Creates a cryptographically valid KCM session token for a given role.
 */
export function createTestSessionToken(
  role: UserRole,
  userId: string = `test-user-${role.toLowerCase()}-${Date.now()}`,
  ttlSeconds: number = 86400 // 24 hours
): string {
  const sessionId = `test_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const rawSecret = crypto.randomBytes(32).toString('hex');
  const expiresAtMs = Date.now() + ttlSeconds * 1000;

  const signaturePayload = `${sessionId}.${rawSecret}.${role}.${expiresAtMs}`;
  const signature = signTestPayload(signaturePayload);

  return `${signaturePayload}.${signature}`;
}

/**
 * Injects a signed role session cookie into a Playwright BrowserContext.
 */
export async function injectRoleSession(
  context: BrowserContext,
  role: UserRole,
  baseUrl?: string
): Promise<string> {
  const token = createTestSessionToken(role);
  const targetUrl = baseUrl || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  const domain = targetUrl
    .replace(/^https?:\/\//, '')
    .split(':')[0]
    .split('/')[0];

  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: token,
      domain,
      path: '/',
      httpOnly: true,
      secure: targetUrl.startsWith('https:'),
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 86400,
    },
  ]);

  return token;
}

/**
 * Clears the session cookie from the context.
 */
export async function clearSessionCookie(context: BrowserContext): Promise<void> {
  await context.clearCookies();
}
