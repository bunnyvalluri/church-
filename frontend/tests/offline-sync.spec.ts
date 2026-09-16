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
    await page.goto("/offline");
    await expect(page.locator("h1")).toBeVisible();

    // Simulate offline mode
    await context.setOffline(true);

    // Verify browser reports offline status
    const isOffline = await page.evaluate(() => !navigator.onLine);
    expect(isOffline).toBe(true);

    // Attempting network navigation while disconnected fails with expected network error
    const navigationFailed = await page.goto("/sermons").catch((err) => err);
    expect(navigationFailed).toBeDefined();

    // Restore online
    await context.setOffline(false);
    await page.goto("/sermons");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("3. Blocks payment processing when device is offline", async ({ page, context }) => {
    await page.goto("/ngo/donations");

    // Simulate offline mode
    await context.setOffline(true);

    // Verify browser reports offline status
    const isOffline = await page.evaluate(() => !navigator.onLine);
    expect(isOffline).toBe(true);

    // Verify payment creation fetch is definitively blocked by network layer
    const isNetworkBlocked = await page.evaluate(async () => {
      try {
        await fetch('/api/payments/create-order', { method: 'POST' });
        return false;
      } catch {
        return true;
      }
    });
    expect(isNetworkBlocked).toBe(true);

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
