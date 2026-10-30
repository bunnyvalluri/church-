/**
 * frontend/tests/route-health/public-routes/publicRoutes.spec.ts
 * Validates that 100% of public-facing church routes load with HTTP 200,
 * render meaningful content, produce zero fatal console crashes, and contain zero broken images.
 */

import { test, expect } from '@playwright/test';
import { discoverAllRoutes } from '../discovery/routeDiscovery';

test.describe('Public Website Route Health & HTTP 200 Validation', () => {
  const allRoutes = discoverAllRoutes();
  const publicRoutes = allRoutes.filter((r) => r.category === 'PUBLIC' && !r.path.includes('['));

  for (const route of publicRoutes) {
    test(`GET ${route.path} responds with 200 and renders DOM without fatal errors`, async ({ page }) => {
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on('pageerror', (err) => {
        if (!err.message.includes('ResizeObserver') && !err.message.includes('analytics')) {
          pageErrors.push(err.message);
        }
      });

      page.on('requestfailed', (req) => {
        const url = req.url();
        if (!url.includes('google-analytics') && !url.includes('facebook') && !url.includes('youtube')) {
          failedRequests.push(`${req.method()} ${url}`);
        }
      });

      const startTime = Date.now();
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 25000,
      });
      const responseTime = Date.now() - startTime;

      expect(response, `No response received for ${route.path}`).not.toBeNull();
      expect(response!.status(), `Expected 200 OK for ${route.path}`).toBe(200);

      // Verify response time within acceptable thresholds (< 5000ms for SSR)
      expect(responseTime).toBeLessThan(5000);

      // Verify Title exists
      const title = await page.title();
      expect(title.length, `Missing document title on ${route.path}`).toBeGreaterThan(0);

      // Verify page has rendered visible text content (non-empty)
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length, `Blank page detected on ${route.path}`).toBeGreaterThan(20);

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter((img) => img.src && !img.src.startsWith('data:') && img.complete && img.naturalWidth === 0)
          .map((img) => img.src);
      });
      expect(brokenImages, `Broken images found on ${route.path}`).toEqual([]);

      // Check for zero fatal JavaScript runtime exceptions
      expect(pageErrors, `Uncaught JS exceptions on ${route.path}`).toEqual([]);
    });
  }
});

