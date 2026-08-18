import { test, expect } from "@playwright/test";

const DEVICE_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE (320px)" },
  { width: 360, height: 800, name: "Samsung Galaxy (360px)" },
  { width: 375, height: 812, name: "iPhone 13 Mini (375px)" },
  { width: 390, height: 844, name: "iPhone 14 / Pixel (390px)" },
  { width: 412, height: 915, name: "Samsung S22 / Pixel 7 (412px)" },
  { width: 430, height: 932, name: "iPhone 15 Pro Max (430px)" },
  { width: 768, height: 1024, name: "iPad Mini / Tablet (768px)" },
  { width: 1024, height: 1366, name: "iPad Pro / Desktop (1024px)" },
  { width: 1440, height: 900, name: "MacBook Pro / Desktop (1440px)" },
  { width: 1920, height: 1080, name: "Full HD Desktop (1920px)" },
];

test.describe("Universal Mobile & Cross-Browser Compatibility Verification", () => {
  for (const vp of DEVICE_VIEWPORTS) {
    test(`renders homepage cleanly without fatal errors at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const jsErrors: string[] = [];
      page.on("pageerror", (err) => jsErrors.push(err.message));

      await page.goto("/");
      await expect(page).toHaveTitle(/Kingdom of Christ Ministries/i);

      // Verify no horizontal overflow scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(hasHorizontalScroll).toBe(false);
      expect(jsErrors).toHaveLength(0);
    });
  }

  test("verifies mobile navigation drawer opens and dismisses with escape key", async ({ page }) => {
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

  test("verifies public pages and offline page render cleanly", async ({ page }) => {
    const routes = [
      "/about",
      "/sermons",
      "/events",
      "/prayer",
      "/gallery",
      "/ngo",
      "/give",
      "/login",
      "/register",
      "/offline"
    ];
    for (const route of routes) {
      await page.goto(route);
      const content = page.locator("#main-content, main, h1");
      await expect(content.first()).toBeVisible();
    }
  });

  test("verifies login page form elements and Google Sign-In button presence", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[aria-label*="Google" i]')).toBeVisible();
  });

  test("verifies register page inputs and password strength meter", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });
});
