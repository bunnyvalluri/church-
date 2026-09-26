# KCM Database Security & Sensitive Data Classification

## 1. Data Classification Matrix

| Classification Level | Examples in Schema | Protection Requirements |
| :--- | :--- | :--- |
| **PUBLIC** | Church services, published events, sermon videos, public testimonials | Public read access via CDN / API |
| **INTERNAL** | Volunteer application status, attendance tallies, branch contact info | Authenticated member or staff access |
| **CONFIDENTIAL** | Member phone numbers, addresses, private prayer requests | Role-based access control (PASTOR, ADMIN), server-side filtering |
| **SENSITIVE** | Donation amounts, donor PAN numbers, 80G tax receipts | SUPER_ADMIN / FINANCE_ADMIN only, encrypted in transit & at rest |
| **HIGHLY SENSITIVE** | Password hashes (`bcrypt`), session token hashes, API secret keys | Salted hashing, zero plaintext storage, strict server-side quarantine |

## 2. Security Controls & Secrets Quarantine
1. **Zero Client Secrets**:
   - `DATABASE_URL`, `DIRECT_URL`, `MONGODB_URI`, `REDIS_URL` are strictly forbidden in client-side bundles and Next.js public environment prefixes (`NEXT_PUBLIC_*`).
2. **Sanitized Error Logging**:
   - Database connection strings, SQL query parameters containing PII, and raw passwords are never emitted to application logs, OpenTelemetry traces, or Sentry reports.
3. **Least-Privilege Database Roles**:
   - Application connections use a dedicated PostgreSQL user with DML permissions only (no `SUPERUSER` or `CREATE ROLE` grants).
