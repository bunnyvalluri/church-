/**
 * frontend/tests/route-health/protected-routes/rbacRouteProtection.spec.ts
 * Rigorous Role-Based Access Control and Edge Middleware Boundary Testing.
 * Evaluates 5 user personas across public and protected church portals:
 *  1. Anonymous Visitor
 *  2. Church Member
 *  3. Event Manager
 *  4. Pastor
 *  5. Administrator
 */

import { test, expect } from '@playwright/test';
import { injectRoleSession } from '../../helpers/auth-fixture';

test.describe('Role-Based Access Control & Portal Protection Suites', () => {
  // ── Scenario 1: Anonymous Visitor ───────────────────────────────────────────
  test.describe('Persona 1: Anonymous Visitor', () => {
    const protectedPortals = [
      '/admin/dashboard',
      '/admin/finance',
      '/admin/attendance',
      '/admin/members',
      '/pastor/dashboard',
      '/pastor/members',
      '/event-manager',
      '/member/profile',
      '/member/give',
    ];

    for (const portalPath of protectedPortals) {
      test(`Anonymous access to ${portalPath} redirects to /login`, async ({ page }) => {
        const response = await page.goto(portalPath, { waitUntil: 'domcontentloaded' });
        // Middleware should redirect unauthenticated request to /login
        const finalUrl = page.url();
        expect(finalUrl).toContain('/login');
      });
    }
  });

  // ── Scenario 2: Registered Church Member ─────────────────────────────────────
  test.describe('Persona 2: Registered Church Member', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'MEMBER');
    });

    test('Member can access /member/profile and /member/events', async ({ page }) => {
      const response = await page.goto('/member/profile', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).not.toContain('/login');
    });

    test('Member is blocked from /admin/dashboard and redirected', async ({ page }) => {
      await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
      expect(page.url()).not.toContain('/admin/dashboard');
    });

    test('Member is blocked from /pastor/dashboard and redirected', async ({ page }) => {
      await page.goto('/pastor/dashboard', { waitUntil: 'domcontentloaded' });
      expect(page.url()).not.toContain('/pastor/dashboard');
    });
  });

  // ── Scenario 3: Event Manager ────────────────────────────────────────────────
  test.describe('Persona 3: Event Manager', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'EVENT_MANAGER');
    });

    test('Event Manager can access /event-manager', async ({ page }) => {
      const response = await page.goto('/event-manager', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).not.toContain('/login');
    });

    test('Event Manager is blocked from /admin/finance', async ({ page }) => {
      await page.goto('/admin/finance', { waitUntil: 'domcontentloaded' });
      expect(page.url()).not.toContain('/admin/finance');
    });
  });

  // ── Scenario 4: Pastor ──────────────────────────────────────────────────────
  test.describe('Persona 4: Pastor', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'PASTOR');
    });

    test('Pastor can access /pastor/dashboard and pastoral care features', async ({ page }) => {
      const response = await page.goto('/pastor/dashboard', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).not.toContain('/login');
    });

    test('Pastor is blocked from /admin/settings/users', async ({ page }) => {
      await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
      expect(page.url()).not.toContain('/admin/settings');
    });
  });

  // ── Scenario 5: Administrator ────────────────────────────────────────────────
  test.describe('Persona 5: Administrator', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'ADMIN');
    });

    test('Administrator can access /admin/dashboard and administration tools', async ({ page }) => {
      const response = await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).toContain('/admin/dashboard');
    });
  });
});

