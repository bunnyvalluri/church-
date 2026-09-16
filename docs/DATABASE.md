# KCM Platform — Database & Polyglot Persistence Architecture

---

## 1. System of Record: Neon PostgreSQL

- **ORM**: Prisma Client (Optimized singleton across frontend & backend).
- **Core Models**:
  - `User`: Members, staff, administrators with role definitions.
  - `Session`: Cryptographically tracked active edge sessions.
  - `Event`: Church conferences, worship services, registrations, seats.
  - `Sermon`: Audio/video media metadata, tags, pastor attribution.
  - `Donation`: Tithes, offerings, campaigns, receipts, payment transactions.
  - `IssueReport`: Member bug reports with browser diagnostics and lifecycle states.

---

## 2. Transaction Integrity & Concurrency

All financial and multi-entity operations use atomic transactions:
```typescript
await prisma.$transaction(async (tx) => {
  await tx.paymentTransaction.create({ ... });
  await tx.donation.update({ ... });
  await tx.receipt.create({ ... });
});
```

---

## 3. Secondary Store: MongoDB Atlas

- **Purpose**: Telemetry, diagnostic logs, and unstructured audit trails.
- **Resilience**: If MongoDB is offline, the primary platform continues operating normally with graceful fallback logging.
