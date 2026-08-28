# Member Privacy, Data Protection & Confidentiality

## Purpose
This document specifies the privacy guidelines, Personally Identifiable Information (PII) protection policies, and confidential data workflows for the Kingdom of Christ Ministries platform.

## Scope
Covers member profiles, pastoral prayer requests, donor financial transactions, baptism records, and data retention lifecycles.

## Status
> Status: Implemented

---

## 1. Privacy Principles & Classification

The church platform processes sensitive spiritual, personal, and financial data under strict confidentiality tiers:

| Tier | Data Classification | Examples | Access Restriction |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Public)** | Public Ministry Data | Sermon titles, speaker names, public church events, general announcements | Unrestricted Public Access |
| **Tier 2 (Community)**| Church Body Data | Public prayer requests, volunteer group names, branch photo galleries | Registered Members Only |
| **Tier 3 (Confidential)**| Personal Spiritual Data | Confidential prayer requests, pastoral counseling notes, personal attendance | Request Owner & Pastoral Staff |
| **Tier 4 (Strictly Private)**| Financial & PII Data | Tithe amounts, payment transaction IDs, PAN/Tax IDs, home addresses, phone numbers | User & Authorized Finance Admin |

---

## 2. PII Masking & Redaction

1. **Log Sanitization**: Application loggers (`backend/src/utils/logger.js` and `frontend/lib/auditLogger.ts`) automatically redact PII fields (`password`, `panNumber`, `creditCard`, `token`, `secret`) before emitting JSON to stdout or MongoDB.
2. **Confidential Prayer Routing**:
   - When a member submits a prayer request with `isPrivate: true`, the record is excluded from public prayer feeds.
   - Only pastoral accounts (`role: PASTOR` or `ADMIN`) can view confidential prayer requests in the Pastor Portal (`/pastor/main/prayer-requests`).

---

## 3. Financial Privacy & Tax Identification

- **Donation Privacy**: Individual giving histories are strictly isolated. No member can view another member's donation amounts.
- **Payment Tokenization**: Credit card numbers and UPI VPA identifiers are processed directly by PCI-DSS certified gateways (Razorpay / Stripe) and never touch or persist on KCM application servers.

---

## 4. Member Data Rights & Retention

- **Right to Access**: Members can export their complete giving statements and personal profile data directly from `/member/profile`.
- **Right to Erasure (Right to be Forgotten)**: Members may request account deletion. Upon administrative approval, personal records are permanently deleted, and financial records are pseudonymized to comply with 80G tax auditing laws while removing personal PII.
- **Retention Schedule**:
  - Financial tax records: 7 Years (statutory requirement).
  - System logs: 90 Days (automatic TTL purge in MongoDB Atlas).
  - Notification dispatch records: 30 Days (automatic TTL purge in MongoDB Atlas).

---

## Security Considerations
- All database backups are encrypted at rest with AES-256.
- Database access is restricted to application VPC pods via strict Kubernetes network policies.

## Related Documentation
- [Security.md](Security.md) — Security controls and encryption standards.
- [Database-Architecture.md](Database-Architecture.md) — Data storage and TTL indexes.
- [Finance.md](Finance.md) — Financial record policies.
