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

  test('verifies Service Worker sw.js is served with Cache-Control headers and scheme security guards', async ({ request }) => {
    const swRes = await request.get(`${BASE_URL}/sw.js`);
    expect(swRes.status()).toBe(200);
    const swText = await swRes.text();

    // Verify version bump
    expect(swText).toContain('CACHE_VERSION = "v6"');

    // Verify protocol scheme guard exists
    expect(swText).toContain('url.protocol !== "http:" && url.protocol !== "https:"');

    // Verify safeCachePut helper is implemented
    expect(swText).toContain('safeCachePut');

    // Verify same-origin isolation for scripts and stylesheets
    expect(swText).toContain('isSameOrigin && url.pathname.match(/\\.(css|js)$/i)');
  });

  test('verifies Web App Manifest is valid and linked', async ({ request }) => {
    const manifestRes = await request.get(`${BASE_URL}/manifest.json`);
    expect(manifestRes.status()).toBe(200);
    const manifest = await manifestRes.json();
    expect(manifest.name).toContain('Kingdom of Christ');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  test('verifies live page execution does not throw chrome-extension Cache.put TypeError', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Ensure no chrome-extension cache put errors occurred
    const extensionCacheErrors = errors.filter((e) =>
      e.includes("Request scheme 'chrome-extension' is unsupported") ||
      e.includes("Failed to execute 'put' on 'Cache'")
    );
    expect(extensionCacheErrors).toHaveLength(0);
  });
});
