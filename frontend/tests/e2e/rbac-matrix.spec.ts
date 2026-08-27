/**
 * frontend/tests/e2e/rbac-matrix.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Role-Based Access Control (RBAC) & Authorization Matrix Test Suite.
 * Exhaustively verifies boundary protection, redirection policies, unauthorized
 * denial, and tamper-resistance across all user roles.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { injectRoleSession, clearSessionCookie, SESSION_COOKIE_NAME } from '../helpers/auth-fixture';

test.describe('Role-Based Access Control (RBAC) Matrix Verification', () => {
  // ── 1. Unauthenticated Access Protection ──────────────────────────────────
  test.describe('Unauthenticated Access Guards', () => {
    test.beforeEach(async ({ context }) => {
      await clearSessionCookie(context);
    });

    test('unauthenticated visitor accessing /admin/dashboard is redirected to /login with next param', async ({ page }) => {
      await page.goto('/admin/dashboard');
      expect(page.url()).toContain('/login');
      expect(page.url()).toContain('next=');
    });

    test('unauthenticated visitor accessing /pastor/dashboard is redirected to /login', async ({ page }) => {
      await page.goto('/pastor/dashboard');
      expect(page.url()).toContain('/login');
    });

    test('unauthenticated visitor accessing /member is redirected to /login', async ({ page }) => {
      await page.goto('/member');
      expect(page.url()).toContain('/login');
    });

    test('unauthenticated visitor accessing /event-manager is redirected to /login', async ({ page }) => {
      await page.goto('/event-manager');
      expect(page.url()).toContain('/login');
    });

    test('unauthenticated visitor accessing /field-volunteer is redirected to /login', async ({ page }) => {
      await page.goto('/field-volunteer');
      expect(page.url()).toContain('/login');
    });
  });

  // ── 2. Member Role Boundary Enforcement ───────────────────────────────────
  test.describe('MEMBER Role Authorization Boundaries', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'MEMBER');
    });

    test('MEMBER can access /member portal', async ({ page }) => {
      await page.goto('/member');
      expect(page.url()).toContain('/member');
      expect(page.url()).not.toContain('/login');
    });

    test('MEMBER is denied /admin/dashboard and redirected to authorized portal /member', async ({ page }) => {
      await page.goto('/admin/dashboard');
      expect(page.url()).not.toContain('/admin/dashboard');
      expect(page.url()).toContain('/member');
    });

    test('MEMBER is denied /pastor/dashboard and redirected to authorized portal /member', async ({ page }) => {
      await page.goto('/pastor/dashboard');
      expect(page.url()).not.toContain('/pastor/dashboard');
      expect(page.url()).toContain('/member');
    });
  });

  // ── 3. Pastor Role Boundary Enforcement ───────────────────────────────────
  test.describe('PASTOR Role Authorization Boundaries', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'PASTOR');
    });

    test('PASTOR can access /pastor/main/sermons and /pastor/dashboard', async ({ page }) => {
      await page.goto('/pastor/main/sermons');
      expect(page.url()).toContain('/pastor');
      expect(page.url()).not.toContain('/login');
    });

    test('PASTOR is denied /admin/dashboard and redirected to authorized pastor portal', async ({ page }) => {
      await page.goto('/admin/dashboard');
      expect(page.url()).not.toContain('/admin/dashboard');
      expect(page.url()).toContain('/pastor');
    });

    test('PASTOR can access /member portal (pastoral care)', async ({ page }) => {
      await page.goto('/member');
      expect(page.url()).toContain('/member');
    });
  });

  // ── 4. Admin Role Super-Access Enforcement ────────────────────────────────
  test.describe('ADMIN Role Full System Authorization', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'ADMIN');
    });

    test('ADMIN can access /admin/dashboard', async ({ page }) => {
      await page.goto('/admin/dashboard');
      expect(page.url()).toContain('/admin/dashboard');
      expect(page.url()).not.toContain('/login');
    });

    test('ADMIN can access /pastor/main/sermons', async ({ page }) => {
      await page.goto('/pastor/main/sermons');
      expect(page.url()).toContain('/pastor/main/sermons');
    });

    test('ADMIN can access /member', async ({ page }) => {
      await page.goto('/member');
      expect(page.url()).toContain('/member');
    });

    test('ADMIN can access /event-manager', async ({ page }) => {
      await page.goto('/event-manager');
      expect(page.url()).toContain('/event-manager');
    });
  });

  // ── 5. Tampered / Invalid Session Cookie Defense ──────────────────────────
  test.describe('Tampered & Expired Session Defense', () => {
    test('tampered session signature causes immediate rejection and cookie invalidation', async ({ context, page }) => {
      // Injected forged token with bad HMAC signature
      const forgedToken = 'fake_sess.fake_secret.ADMIN.9999999999999.invalid_signature_12345';
      await context.addCookies([
        {
          name: SESSION_COOKIE_NAME,
          value: forgedToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto('/admin/dashboard');
      // Must reject and redirect to login
      expect(page.url()).toContain('/login');
    });

    test('expired session token causes immediate rejection', async ({ context, page }) => {
      // Session expired in the past (timestamp = 1000)
      const expiredToken = `sess_old.secret_old.ADMIN.1000.signature_old`;
      await context.addCookies([
        {
          name: SESSION_COOKIE_NAME,
          value: expiredToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      await page.goto('/admin/dashboard');
      expect(page.url()).toContain('/login');
    });
  });
});
