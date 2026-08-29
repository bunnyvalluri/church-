import { test, expect } from "@playwright/test";

test.describe("Multilingual System Verification (EN, TE, HI)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies & localStorage before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });
  });

  test("1. Default English loading and verification", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // Verify key English elements
    const heading = page.locator("h1, #main-content h1, [data-testid='hero-heading']").first();
    await expect(heading).toBeVisible();
    await expect(page.locator("nav")).toContainText(/Home|About/i);
  });

  test("2. Seamless switch to Telugu and verification across routes", async ({ page }) => {
    await page.goto("/");

    // Open language selector and choose Telugu
    const langBtn = page.locator('button[aria-label*="Select Language"]').first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      const teOption = page.locator('button[role="option"]:has-text("తెలుగు"), button:has-text("తెలుగు")').first();
      await expect(teOption).toBeVisible();
      await teOption.click();
    } else {
      // Direct storage / event toggle if custom UI
      await page.evaluate(() => {
        localStorage.setItem("language", "te");
        document.cookie = "kcm-lang=te;path=/";
        window.dispatchEvent(new CustomEvent("kcm-language-change", { detail: "te" }));
      });
      await page.reload();
    }

    // Verify HTML lang attribute becomes 'te'
    await expect(page.locator("html")).toHaveAttribute("lang", "te");

    // Verify Telugu navbar item
    await expect(page.locator("nav")).toContainText(/హోమ్|మా గురించి|కార్యక్రమాలు/);

    // Verify persistence across route navigation: /about/story
    await page.goto("/about/story");
    await expect(page.locator("html")).toHaveAttribute("lang", "te");

    // Verify persistence across route navigation: /events
    await page.goto("/events");
    await expect(page.locator("html")).toHaveAttribute("lang", "te");

    // Verify persistence across route navigation: /sermons
    await page.goto("/sermons");
    await expect(page.locator("html")).toHaveAttribute("lang", "te");

    // Verify persistence across route navigation: /prayer
    await page.goto("/prayer");
    await expect(page.locator("html")).toHaveAttribute("lang", "te");

    // Verify persistence on full page reload
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "te");
  });

  test("3. Seamless switch to Hindi and verification across routes", async ({ page }) => {
    await page.goto("/");

    // Set to Hindi
    await page.evaluate(() => {
      localStorage.setItem("language", "hi");
      document.cookie = "kcm-lang=hi;path=/";
      window.dispatchEvent(new CustomEvent("kcm-language-change", { detail: "hi" }));
    });
    await page.reload();

    // Verify HTML lang attribute becomes 'hi'
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");

    // Verify Hindi navbar item
    await expect(page.locator("nav")).toContainText(/होम|हमारे बारे में|कार्यक्रम|सेवाएं/);

    // Verify persistence on /ngo
    await page.goto("/ngo");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");

    // Verify persistence on /login
    await page.goto("/login");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");

    // Verify persistence on full page reload
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  });

  test("4. Language Toggle Keyboard Accessibility", async ({ page }) => {
    await page.goto("/");

    const langToggleBtn = page.locator('button[aria-label*="Select Language"]').first();
    if (await langToggleBtn.isVisible()) {
      await langToggleBtn.focus();
      // Press Enter to open
      await page.keyboard.press("Enter");

      const menu = page.locator('div[role="listbox"], div[role="menu"]').first();
      await expect(menu).toBeVisible();

      // Press Escape to dismiss
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
    }
  });
});
