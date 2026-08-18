import { test, expect } from "@playwright/test";

const ALL_BREAKPOINTS = [
  { width: 320, height: 568, name: "320px (iPhone SE)" },
  { width: 360, height: 800, name: "360px (Samsung Galaxy Small)" },
  { width: 375, height: 667, name: "375px (iPhone 13 Mini)" },
  { width: 390, height: 844, name: "390px (iPhone 14)" },
  { width: 412, height: 915, name: "412px (Samsung Galaxy S22 / Pixel 7)" },
  { width: 430, height: 932, name: "430px (iPhone 15 Pro Max)" },
  { width: 480, height: 800, name: "480px (Android Large)" },
  { width: 540, height: 720, name: "540px (Foldable / Mini Tablet)" },
  { width: 600, height: 960, name: "600px (Small Tablet)" },
  { width: 768, height: 1024, name: "768px (iPad Mini / Tablet Portrait)" },
  { width: 820, height: 1180, name: "820px (iPad Air Portrait)" },
  { width: 834, height: 1194, name: "834px (iPad Pro 11-inch)" },
  { width: 1024, height: 768, name: "1024px (iPad Landscape / Small Laptop)" },
  { width: 1080, height: 1920, name: "1080px (FHD Portrait)" },
  { width: 1280, height: 800, name: "1280px (Standard Laptop)" },
  { width: 1366, height: 768, name: "1366px (HD Laptop)" },
  { width: 1440, height: 900, name: "1440px (MacBook Pro / Desktop)" },
  { width: 1536, height: 864, name: "1536px (FHD Scaled Laptop)" },
  { width: 1920, height: 1080, name: "1920px (Full HD Monitor)" },
  { width: 2560, height: 1440, name: "2560px (2K QHD Display)" },
  { width: 3840, height: 2160, name: "3840px (4K UHD Display)" },
];

test.describe("Exhaustive 21-Breakpoint Responsive Layout Audit", () => {
  for (const bp of ALL_BREAKPOINTS) {
    test(`renders homepage with zero horizontal overflow at ${bp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/");

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      // Verify no horizontal overflow scrolling (allowing 1px sub-pixel tolerance)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }
});
