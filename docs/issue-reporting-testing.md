# Issue Reporting & Diagnostics Testing Guide

## 1. Test Architecture

The Issue Reporting & Diagnostics suite includes automated end-to-end tests, unit validation, security matrix enforcement, and manual testing procedures.

---

## 2. Automated Test Suite (Playwright)

**Test File**: `frontend/tests/e2e/member-reports.spec.ts`

### Test Scenarios Covered:
1. **Unauthenticated Boundary Guards**:
   - Verify unauthenticated visitor accessing `/member/report` is redirected to `/login`.
   - Verify unauthenticated visitor accessing `/admin/support/reports` is redirected to `/login`.
2. **Member Report Flow**:
   - Verify page renders all 9 categories and 4 severities.
   - Verify presence of direct emergency contact numbers (`+91 9505288171`).
   - Verify required field validation blocks empty submission.
   - Verify "Automatic Diagnostics Captured" disclosure panel displays real non-fabricated browser, OS, and viewport data.
   - Verify report submission succeeds and receives a valid `KCM-ERR-XXXXXXXX` reference ID.
   - Verify "My Submitted Reports" tab lists previously submitted reports.
3. **Admin Support Console**:
   - Verify admin can access `/admin/support/reports` and see filter controls and metrics.
   - Verify regular member is rejected from accessing `/admin/support/reports`.

### Running the Test:
```bash
cd frontend
npx playwright test tests/e2e/member-reports.spec.ts --project=chromium
```

---

## 3. TypeScript & Compilation Verification

Ensure the frontend passes type checking without any errors:
```bash
npm run typecheck -w frontend
```
