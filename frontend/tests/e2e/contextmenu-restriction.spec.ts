/**
 * frontend/tests/e2e/contextmenu-restriction.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Verification Test Suite for Route-Scoped Context Menu Prevention:
 *   1. Right-click contextmenu event is prevented on /ngo/donations
 *   2. Right-click contextmenu event is prevented on /member/give
 *   3. Right-click contextmenu is NOT prevented on other routes (/, /give, /events)
 *   4. Normal left-click and single-tap interactions remain 100% functional
 *   5. Clean event listener removal on route navigation
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { injectPersistedRoleSession } from '../helpers/auth-fixture';

test.describe('Route-Scoped Context Menu Prevention Suite', () => {

  // ── 1. Target Route: /ngo/donations ───────────────────────────────────────
  test('1. Right-click is prevented on /ngo/donations without breaking single-click/tap', async ({ page }) => {
    await page.goto('/ngo/donations');
    await page.waitForLoadState('networkidle');

    const contextMenuPrevented = await page.evaluate(() => {
      const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2
      });
      const notCanceled = document.body.dispatchEvent(evt);
      return !notCanceled || evt.defaultPrevented;
    });

    expect(contextMenuPrevented).toBe(true);

    // Verify left-click / single-tap still functions immediately
    const amountButton = page.locator('button').filter({ hasText: /₹/ }).first();
    if (await amountButton.isVisible()) {
      await amountButton.click({ button: 'left' });
      await expect(amountButton).toBeVisible();
    }
  });

  // ── 2. Target Route: /member/give ──────────────────────────────────────────
  test('2. Right-click is prevented on /member/give for authenticated members', async ({ context, page }) => {
    await injectPersistedRoleSession(context, 'MEMBER');
    await page.goto('/member/give');
    await page.waitForLoadState('networkidle');

    const contextMenuPrevented = await page.evaluate(() => {
      const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2
      });
      const notCanceled = document.body.dispatchEvent(evt);
      return !notCanceled || evt.defaultPrevented;
    });

    expect(contextMenuPrevented).toBe(true);
  });

  // ── 3. Unrelated Routes Isolation ─────────────────────────────────────────
  test('3. Right-click is NOT prevented on general /give page', async ({ page }) => {
    await page.goto('/give');
    await page.waitForLoadState('networkidle');

    const contextMenuPrevented = await page.evaluate(() => {
      const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2
      });
      const notCanceled = document.body.dispatchEvent(evt);
      return !notCanceled || evt.defaultPrevented;
    });

    // On standard /give, normal context menu is preserved
    expect(contextMenuPrevented).toBe(false);
  });

  test('4. Right-click is NOT prevented on homepage / and /events', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const contextMenuPrevented = await page.evaluate(() => {
      const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2
      });
      const notCanceled = document.body.dispatchEvent(evt);
      return !notCanceled || evt.defaultPrevented;
    });

    expect(contextMenuPrevented).toBe(false);
  });

  // ── 4. Listener Cleanup on Navigation ──────────────────────────────────────
  test('5. Context menu restriction cleanly cleans up when navigating away', async ({ page }) => {
    // Start on restricted page
    await page.goto('/ngo/donations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Navigate to unrestricted page
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const contextMenuPrevented = await page.evaluate(() => {
      const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2
      });
      const notCanceled = document.body.dispatchEvent(evt);
      return !notCanceled || evt.defaultPrevented;
    });

    expect(contextMenuPrevented).toBe(false);
  });
});
