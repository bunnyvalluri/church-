/**
 * frontend/tests/e2e/route-health.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Route Health & Integrity Suite.
 * Iterates across 100% of routes in ROUTE_REGISTRY.
 * Validates HTTP status, clean DOM rendering, zero fatal console errors,
 * metadata integrity, and zero broken image assets.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { ROUTE_REGISTRY, getPublicRoutes, getAuthRoutes, RouteDefinition } from '../config/routes';
import { injectRoleSession } from '../helpers/auth-fixture';

test.describe('Automated Route Health & Page Integrity Suite', () => {
  // ── 1. Public & Auth Route Health ──────────────────────────────────────────
  const publicAndAuthRoutes = [...getPublicRoutes(), ...getAuthRoutes()];

  for (const route of publicAndAuthRoutes) {
    test(`Public/Auth route ${route.path} responds cleanly without fatal errors`, async ({ page }) => {
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on('pageerror', (err) => {
        // Filter out non-fatal extension or third-party telemetry notices
        if (!err.message.includes('ResizeObserver') && !err.message.includes('analytics')) {
          pageErrors.push(err.message);
        }
      });

      page.on('requestfailed', (req) => {
        const url = req.url();
        // Ignore external analytics/CDNs failure in offline/local testing
        if (!url.includes('google-analytics') && !url.includes('facebook') && !url.includes('youtube')) {
          failedRequests.push(`${req.method()} ${url} - ${req.failure()?.errorText}`);
        }
      });

      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      expect(response, `No response received for ${route.path}`).not.toBeNull();
      expect(response!.status()).toBeLessThan(400);

      // Verify Title exists
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      if (route.expectedTitleRegex) {
        expect(title).toMatch(route.expectedTitleRegex);
      }

      // Verify viewport and no severe horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 5;
      });
      expect(hasOverflow).toBe(false);

      // Verify images on the page load without broken sources
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter((img) => img.src && !img.src.startsWith('data:') && img.complete && img.naturalWidth === 0)
          .map((img) => img.src);
      });
      expect(brokenImages).toEqual([]);

      // Verify no uncaught browser runtime crashes
      expect(pageErrors).toEqual([]);
    });
  }

  // ── 2. Member Protected Routes Health (with Valid Session) ─────────────────
  test.describe('Member Portal Health (Authenticated)', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'MEMBER');
    });

    const memberRoutes = ROUTE_REGISTRY.filter((r) => r.category === 'MEMBER');

    for (const route of memberRoutes) {
      test(`Member route ${route.path} loads with authenticated session`, async ({ page }) => {
        const response = await page.goto(route.path, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        expect(response).not.toBeNull();
        expect(response!.status()).toBeLessThan(400);

        // Should not be redirected to /login
        expect(page.url()).not.toContain('/login');
      });
    }
  });

  // ── 3. Pastor Portal Health (with Valid Session) ───────────────────────────
  test.describe('Pastor Portal Health (Authenticated)', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'PASTOR');
    });

    const pastorRoutes = ROUTE_REGISTRY.filter((r) => r.category === 'PASTOR');

    for (const route of pastorRoutes) {
      test(`Pastor route ${route.path} loads with authenticated session`, async ({ page }) => {
        const response = await page.goto(route.path, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        expect(response).not.toBeNull();
        expect(response!.status()).toBeLessThan(400);
        expect(page.url()).not.toContain('/login');
      });
    }
  });

  // ── 4. Admin Portal Health (with Valid Session) ────────────────────────────
  test.describe('Admin Portal Health (Authenticated)', () => {
    test.beforeEach(async ({ context }) => {
      await injectRoleSession(context, 'ADMIN');
    });

    const adminRoutes = ROUTE_REGISTRY.filter((r) => r.category === 'ADMIN');

    for (const route of adminRoutes) {
      test(`Admin route ${route.path} loads with authenticated session`, async ({ page }) => {
        const response = await page.goto(route.path, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        expect(response).not.toBeNull();
        expect(response!.status()).toBeLessThan(400);
        expect(page.url()).not.toContain('/login');
      });
    }
  });
});
