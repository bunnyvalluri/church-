/**
 * frontend/tests/route-health/rendering/pageRendering.spec.ts
 * Detailed Page Rendering, Heading Hierarchies & Non-Blank DOM Validation.
 */

import { test, expect } from '@playwright/test';

test.describe('Page Rendering & Visual Landmark Validation', () => {
  const primaryPages = [
    { path: '/', titleKeyword: 'Kingdom of Christ', minHeadings: 1 },
    { path: '/about', titleKeyword: 'About', minHeadings: 1 },
    { path: '/sermons', titleKeyword: 'Sermon', minHeadings: 1 },
    { path: '/events', titleKeyword: 'Event', minHeadings: 1 },
    { path: '/prayer', titleKeyword: 'Prayer', minHeadings: 1 },
    { path: '/locations', titleKeyword: 'Location', minHeadings: 1 },
    { path: '/give', titleKeyword: 'Give', minHeadings: 1 },
    { path: '/ngo', titleKeyword: 'NGO', minHeadings: 1 },
    { path: '/login', titleKeyword: 'Login', minHeadings: 1 },
  ];

  for (const pageItem of primaryPages) {
    test(`Page ${pageItem.path} renders valid semantic landmarks and visible text`, async ({ page }) => {
      await page.goto(pageItem.path, { waitUntil: 'domcontentloaded' });

      // Verify title matches expected keyword
      const title = await page.title();
      expect(title.toLowerCase()).toContain(pageItem.titleKeyword.toLowerCase());

      // Check for headings (h1, h2, or h3)
      const headingCount = await page.locator('h1, h2, h3').count();
      expect(headingCount).toBeGreaterThanOrEqual(pageItem.minHeadings);

      // Verify main landmark or content container exists
      const mainExists = (await page.locator('main, #main-content, div[role="main"]').count()) > 0;
      expect(mainExists).toBe(true);

      // Verify page is not blank
      const innerText = await page.locator('body').innerText();
      expect(innerText.trim().length).toBeGreaterThan(50);
    });
  }
});

