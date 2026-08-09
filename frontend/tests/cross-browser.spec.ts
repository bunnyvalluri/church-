import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE (320px)" },
  { width: 360, height: 800, name: "Samsung Galaxy (360px)" },
  { width: 375, height: 812, name: "iPhone 13 Mini (375px)" },
  { width: 390, height: 844, name: "iPhone 14 / Pixel (390px)" },
  { width: 412, height: 915, name: "Samsung S22 / Pixel 7 (412px)" },
  { width: 430, height: 932, name: "iPhone 15 Pro Max (430px)" },
  { width: 768, height: 1024, name: "iPad Mini / Tablet (768px)" },
  { width: 1024, height: 1366, name: "iPad Pro / Desktop (1024px)" },
];

test.describe("Universal Mobile & Cross-Browser Compatibility Verification", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`renders homepage cleanly at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const jsErrors: string[] = [];
      page.on("pageerror", (err) => jsErrors.push(err.message));

      await page.goto("/");
      await expect(page).toHaveTitle(/Kingdom of Christ Ministries/i);

      // Verify no horizontal overflow scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
      expect(jsErrors).toHaveLength(0);
    });
  }

  test("verifies mobile navigation drawer opens and dismisses", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const menuButton = page.locator('button[aria-label="Open navigation menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      const mobileDrawer = page.locator("#mobile-menu");
      await expect(mobileDrawer).toBeVisible();

      // Test escape key dismissal
      await page.keyboard.press("Escape");
      await expect(mobileDrawer).not.toBeVisible();
    }
  });

  test("verifies public routes render without fatal exceptions", async ({ page }) => {
    const routes = ["/about", "/sermons", "/events", "/prayer", "/gallery", "/ngo", "/login", "/register"];
    for (const route of routes) {
      await page.goto(route);
      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeVisible();
    }
  });
});
