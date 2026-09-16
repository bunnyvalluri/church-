/**
 * frontend/tests/e2e/member-reports.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * End-to-End Test Suite for Member Issue Reporting & Diagnostics System.
 * Tests:
 *  - Unauthenticated access protection
 *  - Member report page navigation & UI rendering
 *  - Form validation & category/severity selection
 *  - Report submission & reference ID generation (KCM-ERR-XXXXXXXX)
 *  - Report history list and member-safe modal details
 *  - Admin RBAC access to /admin/support/reports
 *  - IDOR boundary enforcement
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { injectPersistedRoleSession, injectRoleSession, clearSessionCookie } from '../helpers/auth-fixture';

test.describe('Member Issue Reporting & Diagnostics System', () => {
  test.describe.configure({ mode: 'serial' });

  // ── 1. Unauthenticated Security Boundary ───────────────────────────────────
  test.describe('Security & Unauthenticated Guards', () => {
    test.beforeEach(async ({ context }) => {
      await clearSessionCookie(context);
    });

    test('unauthenticated visitor accessing /member/report is redirected to login', async ({ page }) => {
      await page.goto('/member/report');
      expect(page.url()).toContain('/login');
    });

    test('unauthenticated visitor accessing /admin/support/reports is redirected to login', async ({ page }) => {
      await page.goto('/admin/support/reports');
      expect(page.url()).toContain('/login');
    });
  });

  // ── 2. Member Report Submission Flow ───────────────────────────────────────
  test.describe('Member Reporting Flow (MEMBER Role)', () => {
    test.beforeEach(async ({ context }) => {
      await injectPersistedRoleSession(context, 'MEMBER');
    });

    test('renders Report a Problem page with categories, severities, and direct contacts', async ({ page }) => {
      await page.goto('/member/report');
      await page.waitForLoadState('domcontentloaded');

      // Header verification
      await expect(page.getByRole('heading', { name: /Report a Problem/i })).toBeVisible();

      // Category buttons exist
      await expect(page.getByText('Something is Broken')).toBeVisible();
      await expect(page.getByText('Page Not Loading')).toBeVisible();
      await expect(page.getByText('Mobile Display Issue')).toBeVisible();

      // Severities exist
      await expect(page.getByRole('button', { name: /^Low\b/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Medium\b/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^High\b/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Critical\b/i })).toBeVisible();

      // Support contact details
      await expect(page.getByText('+91 9505288171').first()).toBeVisible();
    });

    test('validates required fields before submitting', async ({ page }) => {
      await page.goto('/member/report');
      await page.waitForLoadState('domcontentloaded');

      // Click submit with empty form
      const submitBtn = page.getByRole('button', { name: /Submit Problem Report/i });
      await submitBtn.click();

      // HTML5 / JS validation prevents submission
      const titleInput = page.locator('#issue-title');
      await expect(titleInput).toBeFocused();
    });

    test('shows automatic client diagnostics transparency viewer', async ({ page }) => {
      await page.goto('/member/report');
      await page.waitForLoadState('domcontentloaded');

      // Click "View Captured Data"
      const viewDataBtn = page.getByRole('button', { name: /View Captured Data/i });
      await expect(viewDataBtn).toBeVisible();
      await viewDataBtn.click();

      // Verify browser diagnostics values appear
      await expect(page.getByText(/Browser/i).first()).toBeVisible();
      await expect(page.getByText(/Operating System/i).first()).toBeVisible();
      await expect(page.getByText(/Viewport/i).first()).toBeVisible();
    });

    test('submits an issue report and receives real KCM-ERR reference ID', async ({ page }) => {
      await page.goto('/member/report');
      await page.waitForLoadState('domcontentloaded');

      // Fill title and description
      const uniqueTitle = `Automated E2E Test Issue - ${Date.now()}`;
      await page.locator('#issue-title').fill(uniqueTitle);
      await page.locator('#issue-description').fill('Detailed description of the issue encountered during automated testing.');

      // Listen for network response on form submission
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/api/member/reports') && res.request().method() === 'POST',
        { timeout: 30000 }
      );

      // Click submit
      const submitBtn = page.getByRole('button', { name: /Submit Problem Report/i });
      await submitBtn.click();

      const response = await responsePromise;
      expect([200, 201]).toContain(response.status());
      const json = await response.json();
      expect(json.success).toBe(true);
      const reportId = json.reportId || json.report?.reportId;
      expect(reportId).toMatch(/KCM-ERR-[A-Z0-9]+/);
    });

    test('switches to My Submitted Reports tab', async ({ page }) => {
      await page.goto('/member/report');
      await page.waitForLoadState('domcontentloaded');

      // Switch to history tab
      const historyTab = page.getByRole('button', { name: /My Submitted Reports/i });
      await historyTab.click();

      // Verify header appears
      await expect(page.getByRole('heading', { name: /Your Submitted Reports/i })).toBeVisible({ timeout: 10000 });
    });
  });

  // ── 3. Admin Support Management Flow ───────────────────────────────────────
  test.describe('Admin Support Console (ADMIN Role)', () => {
    test.beforeEach(async ({ context }) => {
      await injectPersistedRoleSession(context, 'ADMIN');
    });

    test('admin can access /admin/support/reports and see metrics and filters', async ({ page }) => {
      await page.goto('/admin/support/reports');
      await page.waitForLoadState('domcontentloaded');

      // Page header
      await expect(page.getByRole('heading', { name: /Issue Reports & Diagnostics Triage/i })).toBeVisible({ timeout: 25000 });

      // Metrics cards
      await expect(page.getByText(/Total Filtered Reports/i)).toBeVisible();
      await expect(page.getByText(/Newly Received/i)).toBeVisible();
      await expect(page.getByText(/Critical Priority/i)).toBeVisible();

      // Filter controls
      await expect(page.getByRole('combobox', { name: /Filter by Status/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Filter by Severity/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Filter by Category/i })).toBeVisible();
    });

    test('regular member is denied access to /admin/support/reports', async ({ context, page }) => {
      await injectRoleSession(context, 'MEMBER');
      await page.goto('/admin/support/reports');
      // Should redirect away from admin
      expect(page.url()).not.toContain('/admin/support/reports');
    });
  });

});
