/**
 * frontend/tests/smoke/production-smoke.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Post-Deployment Production Smoke Test Suite.
 * Target: https://kcmchurch.vercel.app/ (or PLAYWRIGHT_TEST_BASE_URL)
 * Verifies live site availability, critical public workflows, robots.txt, sitemap,
 * and API health endpoints without destructive actions or data mutation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';

test.describe('Production Post-Deployment Smoke Verification', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://kcmchurch.vercel.app';

  test('verifies live production homepage HTTP 200 and title integrity', async ({ page }) => {
    const res = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);

    const title = await page.title();
    expect(title).toMatch(/Kingdom of Christ|KCM/i);

    const mainHeader = page.locator('header');
    await expect(mainHeader).toBeVisible();
  });

  test('verifies robots.txt and sitemap.xml endpoints are live and healthy', async ({ request }) => {
    const robotsRes = await request.get(`${BASE_URL}/robots.txt`);
    expect([200, 304]).toContain(robotsRes.status());
    const robotsText = await robotsRes.text();
    expect(robotsText).toMatch(/user-agent/i);

    const sitemapRes = await request.get(`${BASE_URL}/sitemap.xml`);
    expect([200, 304]).toContain(sitemapRes.status());
  });

  test('verifies health API endpoint responds with healthy status', async ({ request }) => {
    const healthRes = await request.get(`${BASE_URL}/api/health`);
    expect([200, 204]).toContain(healthRes.status());
  });

  test('verifies essential public routes load cleanly in production', async ({ page }) => {
    const essentialRoutes = [
      '/about',
      '/sermons',
      '/events',
      '/prayer',
      '/gallery',
      '/ngo',
      '/give',
      '/login',
      '/register',
    ];

    for (const route of essentialRoutes) {
      const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `Route ${route} returned non-200 status`).toBe(200);
      const mainContent = page.locator('#main-content, main');
      await expect(mainContent.first()).toBeVisible();
    }
  });
});
