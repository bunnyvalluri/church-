/**
 * frontend/tests/route-health/link-checks/internalLinkCrawler.spec.ts
 * Internal Link Integrity & Crawl Validation Suite.
 * Scans public pages, navigation headers, and footers to ensure zero broken links (404/500).
 */

import { test, expect } from '@playwright/test';

test.describe('Internal Link Integrity & Dead-Link Crawler', () => {
  const crawlRoots = ['/', '/about', '/events', '/sermons', '/prayer', '/locations', '/give', '/ngo'];

  for (const root of crawlRoots) {
    test(`Page ${root} contains valid internal links without broken 404 targets`, async ({ page, request }) => {
      await page.goto(root, { waitUntil: 'domcontentloaded' });

      // Collect all internal anchor hrefs
      const internalLinks: string[] = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        const origin = window.location.origin;
        return anchors
          .map((a) => a.getAttribute('href') || '')
          .filter(
            (href) =>
              href.startsWith('/') &&
              !href.startsWith('//') &&
              !href.startsWith('/#') &&
              !href.includes('mailto:') &&
              !href.includes('tel:')
          )
          .map((href) => href.split('#')[0]) // Strip hash anchors
          .filter((href, idx, arr) => href.length > 0 && arr.indexOf(href) === idx);
      });

      // Sample and test internal links (limit to first 15 unique links per page to keep runtime bounded)
      const sampledLinks = internalLinks.slice(0, 15);

      for (const link of sampledLinks) {
        const linkRes = await request.get(link);
        // Link should return < 400 (or 302/307 if redirected to auth)
        expect(
          linkRes.status(),
          `Broken link found on ${root} pointing to ${link} (Status: ${linkRes.status()})`
        ).toBeLessThan(404);
      }
    });
  }
});

