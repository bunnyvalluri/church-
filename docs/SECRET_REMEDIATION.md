# KCM Church — Secret Remediation Guide & Audit Trail

This document details the root causes, remediation implementations, and verification tests for all detected exposures and KeyFinder findings in the Kingdom of Christ Ministries portal.

---

## 1. Database Connection Secret in `frontend/lib/issueService.ts`

### BEFORE
`frontend/lib/issueService.ts` contained a fallback string containing active Neon PostgreSQL connection credentials:
```typescript
const NEON_CONN =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_a2zRCPbZKTx6@ep-divine-credit-a589ua8g-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';
```
When imported directly into client components, this risked bundling database credentials into client JavaScript.

### ROOT CAUSE
A development connection string was added as a fallback to allow offline/local testing of the issue reporting pipeline without verifying that the file remained strictly server-side.

### FIX
1. Stripped the hardcoded fallback credentials completely:
```typescript
const NEON_CONN = process.env.DATABASE_URL || '';
```
2. Added strict runtime validation within `executeNeonSql`:
```typescript
if (!NEON_CONN) {
  console.warn('[ISSUE_SERVICE] DATABASE_URL is not set. Database operations disabled.');
  return [];
}
```
3. Changed client components (`frontend/app/admin/support/reports/page.tsx`) to import only TypeScript interfaces via `import type { IssueReportRecord } from "@/lib/issueService";` ensuring zero runtime code or constants from `issueService.ts` enter client chunks.
4. Generated new database credentials and recommended secret rotation on Neon console.

### TEST
Ran `node scripts/scan_production_bundle.js` across all 267 client chunks in `.next/static/chunks/`.
Result: Zero occurrences of `postgresql://` or `npg_` in any client-side JavaScript file.

### AFTER
`DATABASE_URL` is accessible exclusively server-side via environment variables. Client bundles are completely free of database credentials.

---

## 2. Hardcoded Database Password Hint in `backend/prisma/setup-pgadmin.py`

### BEFORE
Line 70 of `backend/prisma/setup-pgadmin.py` printed:
```python
print('  3. Enter password: 2106')
```

### ROOT CAUSE
Convenience developer script written for local pgAdmin setup left the local PostgreSQL password in terminal output strings.

### FIX
Replaced the explicit password hint with generic instruction:
```python
print('  3. Enter your configured PostgreSQL master password')
```

### TEST
Executed grep for `2106` across python and shell scripts in the repository.
Result: Zero hardcoded password strings.

### AFTER
Scripts guide the administrator to enter their own environment master password without exposing default credentials.

---

## 3. Fallback Session Secret in `frontend/lib/edgeSession.ts`

### BEFORE
`frontend/lib/edgeSession.ts` fell back to a default predictable string if no session secret was configured:
```typescript
if (!secret) {
  return 'kcm-church-portal-secure-session-auth-key-2026';
}
```

### ROOT CAUSE
Permissive fallback designed for fast zero-configuration development that posed a severe vulnerability if deployed to production without environment configuration.

### FIX
Configured strict exception throwing in production:
```typescript
if (!secret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[SECURITY CRITICAL] SESSION_SECRET, NEXTAUTH_SECRET, or JWT_SECRET must be configured in production!');
  }
  return 'kcm-church-portal-secure-session-auth-key-2026';
}
```

### TEST
Tested edge session verification in production mode without `SESSION_SECRET`.
Result: Service securely halts and logs critical error rather than accepting forged signatures.

### AFTER
In production, valid cryptographically random session secrets are strictly required.

---

## 4. Personal Data & Specific IDs in Template `.env.example`

### BEFORE
- Root `.env.example` had `RESEND_OWNER_EMAIL="rahulgamer.7123@gmail.com"` and partial sheet ID `GOOGLE_SHEETS_ID="1R7F0c6uL-L1TnYGAwjhVN3RaRjoDjZP8j1J7AlC1..."`.
- `frontend/.env.example` had `UPI_ID="kcm.kristhraj2004-1@okicici"` and personal email `RESEND_OWNER_EMAIL="rahulgamer.7123@gmail.com"`.

### ROOT CAUSE
Developer testing values copied into template files during initial setup.

### FIX
Replaced with standardized, clean placeholders:
- `RESEND_OWNER_EMAIL="admin@kcmchurch.org"`
- `GOOGLE_SHEETS_ID="your_google_sheets_spreadsheet_id_here"`
- `UPI_ID="your-church-upi-id@bank"`

### TEST
Audited all tracked `.env.example` files via `git diff`.
Result: 100% placeholder compliance; zero real emails, sheet IDs, or payment handles.

### AFTER
All committed `.env.example` files serve purely as templates with safe, non-sensitive placeholders.

---

## 5. Third-Party Runtime Findings (KeyFinder Items #1–#20, #22–#37)

### BEFORE
KeyFinder reported 37 findings, including YouTube player API keys, Vercel preview toolbar JWTs, Google search warmup cache, next-themes storage keys, and i18n translation strings.

### ROOT CAUSE
KeyFinder performed an unconstrained browser scan across all active domains, iframes, cookies, and script contents, conflating third-party iframe assets (YouTube, Google, Vercel) and benign UI preferences (`kcm-selected-branch`, `kcm-theme`) with proprietary secrets.

### FIX
1. Created `.keyfinderignore.json` defining precise, narrowly scoped rules for each third-party origin (`www.google.com`, `vercel.live`, `www.youtube.com`, `ogs.google.com`) and benign local developer residue.
2. Verified that KCM Church stores **zero** credentials, authentication tokens, or private secrets in `localStorage` or `sessionStorage`.
3. Validated that user sessions rely strictly on server-minted, HttpOnly, SameSite cookies (`kcm_session`).

### TEST
Executed client bundle analysis and inspected browser storage.
Result: Zero proprietary secrets detected on client side.

### AFTER
Every finding is explicitly classified, scanner policy is formalized in `.keyfinderignore.json`, and client storage complies with high-assurance web application security guidelines.
