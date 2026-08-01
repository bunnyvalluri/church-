import { test, expect } from "@playwright/test";

test.describe("WCAG 2.2 AA Accessibility Audit", () => {
  test("renders SkipToContent link for keyboard users", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);
  });

  test("main content container has focusable tabIndex", async ({ page }) => {
    await page.goto("/");
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toHaveCount(1);
    await expect(mainContent).toHaveAttribute("tabindex", "-1");
  });
});
