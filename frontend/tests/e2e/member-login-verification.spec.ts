import { test, expect } from "@playwright/test";

test.describe("Member Login Verification Screen — Strict Route Isolation", () => {
  test("shows verification screen only on /login and transitions within 3 seconds", async ({ page }) => {
    // Navigate to /login (Member Login)
    await page.goto("/login");

    // The KCM verification screen must be visible initially
    const heading = page.locator("text=Checking your browser before accessing");
    const subHeading = page.locator("text=Member Login");
    const emblem = page.locator('img[alt="Kingdom of Christ Ministries Emblem"]');
    const tagline = page.locator("text=KINGDOM OF CHRIST MINISTRIES");

    // Check verification elements
    await expect(heading).toBeVisible({ timeout: 2000 });
    await expect(subHeading).toBeVisible();
    await expect(emblem).toBeVisible();
    await expect(tagline).toBeVisible();

    // Verify background is pure white
    const mainBg = page.locator("main");
    await expect(mainBg).toHaveClass(/bg-white/);

    // Verify it automatically transitions to MemberLoginForm within 3000ms
    const loginFormBtn = page.locator('button[type="submit"]');
    await expect(loginFormBtn).toBeVisible({ timeout: 4000 });

    // After transition, verification screen is gone and login form is interactive
    await expect(heading).not.toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("does NOT show verification screen on /admin/login", async ({ page }) => {
    await page.goto("/admin/login");

    // Verification screen heading must NOT be visible
    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();

    // Admin login form must be directly available
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("does NOT show verification screen on /pastor/login", async ({ page }) => {
    await page.goto("/pastor/login");

    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("does NOT show verification screen on /event-manager/login", async ({ page }) => {
    await page.goto("/event-manager/login");

    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("does NOT show verification screen on /portal-select", async ({ page }) => {
    await page.goto("/portal-select");

    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();
  });

  test("does NOT show verification screen on /register", async ({ page }) => {
    await page.goto("/register");

    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();
  });

  test("does NOT show verification screen on public homepage /", async ({ page }) => {
    await page.goto("/");

    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();
  });

  test("bypasses verification if accessed with admin query parameters (/login?next=/admin/dashboard)", async ({ page }) => {
    await page.goto("/login?next=/admin/dashboard");

    // Because target is an admin route, secondary safeguard prevents verification
    const verificationHeading = page.locator("text=Checking your browser before accessing");
    await expect(verificationHeading).not.toBeVisible();

    // Login form directly visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
