# Issue Reporting & Diagnostics Security Model

## 1. Threat Matrix & Mitigations

| Threat | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | Non-admin user views another member's private bug reports or details. | Endpoint `/api/member/reports/[reportId]` checks `report.userId === auth.uid`. If unauthorized and not admin, returns 404/403. |
| **Data Leakage (PII & Secrets)** | Bearer tokens, passwords, cookies, or internal server paths exposed in logs or tickets. | `sanitizeDiagnosticText()` strips Bearer tokens, JWTs, cookie headers, card numbers, passwords, and server DB connection strings before storing. |
| **Denial of Service / Spam** | Malicious client floods the database with automated reports. | `isRateLimited(ip, { windowMs: 15 * 60 * 1000, maxRequests: 10 })` enforces strict rate limits per IP. |
| **Malicious File Upload** | Attacker uploads executables, HTML, or SVG disguised as screenshots. | `validateFileSecurity()` checks MIME type, max 5MB size limit, and verifies binary magic numbers. Only JPG, PNG, and WebP are allowed. |
| **Privilege Escalation** | Regular member triggers admin triage or alters ticket status. | `requireAdmin()` middleware guards all `/api/admin/reports/*` endpoints. Middleware redirects unauthorized members away from `/admin/*`. |
| **Information Disclosure to Members** | Sensitive server traces or internal admin notes visible to members. | Member-facing endpoints explicitly omit `internalNotes`, `errorStackSanitized`, and server variables. |

---

## 2. RBAC Access Policy

- **Unauthenticated Visitors**: Denied access to report submission and administration. Redirected to `/login`.
- **MEMBER Role**:
  - Can create issue reports for their own account.
  - Can upload screenshot attachments (validated).
  - Can view their own submitted reports.
  - Denied access to any other user's reports.
  - Denied access to internal admin notes and unmasked stack traces.
- **ADMIN / SUPER_ADMIN Role**:
  - Can view all reports across all members.
  - Can filter, search, inspect raw diagnostics and error context.
  - Can update ticket status, assign staff, and record internal investigation notes.
