# KCM Database Indexing & Query Optimization Guide

## 1. Index Strategy Overview
The KCM schema uses a comprehensive indexing strategy targeting three primary query profiles:
1. **Foreign Key Traversals**: All relational lookup keys (`userId`, `eventId`, `sermonId`, `branchId`, `sessionId`) are indexed.
2. **Filtering & Sorting Combinations**: Composite indexes covering status, dates, and sort orders.
3. **Idempotency & Deduplication**: Unique indexes on external IDs, hashes, and token values.

## 2. Key Index Matrix

| Table / Model | Index Columns | Index Type | Query Target & Purpose |
| :--- | :--- | :--- | :--- |
| `members` (`User`) | `email` | UNIQUE | Fast authentication lookup & uniqueness enforcement |
| `sessions` (`Session`) | `sessionTokenHash` | UNIQUE | Session verification per HTTP request |
| `sessions` (`Session`) | `[userId]`, `[expiresAt]` | INDEX | User session cleanup and active device lookup |
| `events` (`Event`) | `slug` | UNIQUE | SEO URL routing and page rendering |
| `events` (`Event`) | `[branchId]`, `[createdById]` | INDEX | Branch-level event filtering & management |
| `event_registrations` | `[userId, eventId]` | UNIQUE | Duplicate registration prevention |
| `donations` (`Donation`) | `razorpayOrderId` | INDEX | Fast webhook lookup by payment order |
| `donations` (`Donation`) | `[userId]`, `[branchId]`, `[sessionId]` | INDEX | Member donation history & branch finance reports |
| `payment_webhooks` | `webhookEventId` | UNIQUE | Replay attack prevention & webhook deduplication |
| `receipts` (`Receipt`) | `receiptNumber`, `verificationCode` | UNIQUE | Instant public tax receipt verification |
| `sermons` (`Sermon`) | `[date]`, `[category]`, `[slug]` | INDEX | Sermon catalog filtering and archive browsing |
| `sms_messages` (`SmsMessage`)| `idempotencyKey`, `providerMessageId` | UNIQUE | SMS delivery deduplication & provider status webhooks |

## 3. Query Guidelines (Avoiding N+1 and Large Offsets)
- **Selective Projections**: In Prisma queries, use `select: { ... }` instead of fetching full entity bodies on high-volume listing endpoints.
- **Bounded Pagination**: All API listing endpoints enforce default `take: 20` and maximum `take: 100` limits.
