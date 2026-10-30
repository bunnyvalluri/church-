/**
 * frontend/tests/route-health/responsive/viewportTesting.spec.ts
 * Multi-Viewport & Mobile Horizontal Overflow Validation.
 */

import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile (375x667)', width: 375, height: 667 },
  { name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { name: 'Desktop (1280x800)', width: 1280, height: 800 },
];

test.describe('Responsive Viewport & Overflow Validation', () => {
  const routesToTest = ['/', '/about', '/events', '/sermons', '/give', '/prayer', '/locations'];

  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of routesToTest) {
        test(`Route ${route} fits within ${vp.width}px without horizontal overflow`, async ({ page }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' });

          const hasOverflow = await page.evaluate((maxWidth) => {
            return document.documentElement.scrollWidth > maxWidth + 4;
          }, vp.width);

          expect(hasOverflow, `Horizontal scroll detected on ${route} at ${vp.width}px`).toBe(false);
        });
      }
    });
  }
});

