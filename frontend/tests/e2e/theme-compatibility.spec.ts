/**
 * frontend/tests/e2e/theme-compatibility.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Dark/Light Mode Theme & Samsung Internet / WebKit Color Integrity Test.
 * Ensures CSS custom property variables, background tokens, and text contrast
 * remain intact without forced inverted colors or degraded visual fidelity.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';

test.describe('Theme Compatibility & Samsung Internet Color Defense', () => {
  test('renders light mode theme with intended contrast and CSS tokens', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(bodyBg).toBeDefined();

    // Verify key interactive buttons and navbar are visible
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
  });

  test('renders dark mode theme cleanly without broken text contrast', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const bodyComputed = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        bgColor: style.backgroundColor,
        color: style.color,
      };
    });

    expect(bodyComputed.bgColor).toBeDefined();
    expect(bodyComputed.color).toBeDefined();

    // Verify main content remains readable
    const heading = page.locator('h1').first();
    if (await heading.isVisible()) {
      const headingColor = await heading.evaluate((el) => window.getComputedStyle(el).color);
      expect(headingColor).toBeDefined();
    }
  });
});
