# KCM Portal — Database & Data Ownership Architecture

## 1. Dual-Database Ownership Model

To balance transactional rigor with flexible high-volume telemetry, KCM implements a clear source-of-truth separation between PostgreSQL and MongoDB:

```
+-----------------------------------------------------------------------------------+
|                        DATA OWNERSHIP & SCHEMA REGISTRY                           |
+-----------------------------------------------------------------------------------+
| 1. PostgreSQL / Neon (Relational Source of Truth - Prisma ORM)                    |
|    - User, Account, Session, VerificationToken (NextAuth)                         |
|    - Branch (Shapur, Subhash Nagar, Bahadurpally)                                 |
|    - Event, EventMedia, EventRegistration                                         |
|    - Sermon, SermonMedia                                                          |
|    - Donation, Receipt, GivingGoal                                                |
|    - PrayerRequest, FamilyGroup, MinistryMember                                   |
|    - NotificationLog, EmailAuditLog                                               |
|                                                                                   |
| 2. MongoDB Atlas (Unstructured Telemetry & Document Store)                         |
|    - SecurityAuditLog, SystemHealthTelemetry                                      |
|    - OpenClawAgentConversationLogs                                                |
|    - IssueReportingDiagnostics (Client error stack traces)                        |
|                                                                                   |
| 3. Redis (In-Memory Transient State)                                              |
|    - BullMQ job queues, WebSocket active sockets, temporary rate-limit counters  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Connection Management & Pooling

- **Neon PostgreSQL**: Employs connection pooling via direct PgBouncer configuration (`?sslmode=require&pgbouncer=true`).
- **Prisma Client Singleton**: Managed via [`frontend/lib/prisma.ts`](file:///c:/K.C.M-Portal/frontend/lib/prisma.ts) ensuring connection reuse across Next.js API route invocations.
- **Transactions**: Multi-table updates (e.g. Donation commit + Receipt creation + Goal counter update) utilize Prisma `$transaction` blocks to ensure ACID atomicity.
