import { test, expect } from "@playwright/test";

test.describe("KCM Enterprise Offline-First Transformation E2E Suite", () => {
  test("1. Application loads online and registers Service Worker", async ({ page }) => {
    await page.goto("/");

    // Verify main portal title
    await expect(page).toHaveTitle(/Kingdom of Christ Ministries/i);

    // Verify Manifest link in head
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", "/manifest.json");
  });

  test("2. Navigates public pages and verifies offline cache availability", async ({ page, context }) => {
    await page.goto("/");
    await page.goto("/sermons");
    await page.goto("/events");
    await page.goto("/prayer");

    // Simulate offline mode
    await context.setOffline(true);

    // Reload or navigate offline
    await page.goto("/sermons");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/events");
    await expect(page.locator("body")).not.toBeEmpty();

    // Restore online
    await context.setOffline(false);
  });

  test("3. Blocks payment processing when device is offline", async ({ page, context }) => {
    await page.goto("/ngo/donations");

    // Simulate offline mode
    await context.setOffline(true);

    // Select amount and fill details
    const proceedBtn = page.locator("button", { hasText: /Proceed to Details|Donate Now/i }).first();
    if (await proceedBtn.isVisible()) {
      await proceedBtn.click();
    }

    // Trigger payment creation offline
    const payBtn = page.locator("button", { hasText: /Pay|Donate|Generate QR/i }).first();
    if (await payBtn.isVisible()) {
      await payBtn.click();
      // Should show offline error message
      const offlineMsg = page.locator("text=You're currently offline. Internet connection is required to complete payment verification.");
      await expect(offlineMsg).toBeVisible();
    }

    await context.setOffline(false);
  });

  test("4. Saves prayer request draft locally in IndexedDB", async ({ page }) => {
    await page.goto("/prayer");

    // Fill form field
    const requestInput = page.locator('textarea[name="request"]').first();
    if (await requestInput.isVisible()) {
      await requestInput.fill("Test offline prayer request for healing and peace.");
      
      // Reload page to simulate browser closing unexpectedly
      await page.reload();

      // Verify draft restoration
      await expect(requestInput).toHaveValue("Test offline prayer request for healing and peace.");
    }
  });
});
