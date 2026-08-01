import { test, expect } from "@playwright/test";

const breakpoints = [
  { width: 320, height: 568, name: "Mobile Small (320px)" },
  { width: 375, height: 667, name: "Mobile Medium (375px)" },
  { width: 768, height: 1024, name: "Tablet (768px)" },
  { width: 1024, height: 768, name: "Laptop (1024px)" },
  { width: 1440, height: 900, name: "Desktop (1440px)" },
  { width: 2560, height: 1440, name: "Ultra-wide (2560px)" },
];

test.describe("Responsive Layout Breakpoint Audit", () => {
  for (const bp of breakpoints) {
    test(`renders without horizontal scroll overflow at ${bp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/");

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      // Verify no horizontal overflow
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }
});
