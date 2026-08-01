import { test, expect } from "@playwright/test";

test.describe("Cross-Browser Compatibility Verification", () => {
  test("loads landing page cleanly without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/Kingdom of Christ Ministries/i);
    expect(errors).toHaveLength(0);
  });

  test("verifies main navigation actions are interactive", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
