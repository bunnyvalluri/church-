# KCM Data Source of Truth & Consistency Matrix

## 1. Source of Truth Matrix

| Entity | Primary Source of Truth | Secondary / Cache Storage | Consistency Model | Conflict Resolution Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Users & Credentials** | PostgreSQL (`members`) | Redis session store | Strong Consistency | PostgreSQL authoritative; Redis invalidated on password/role change |
| **RBAC Roles & Permissions** | PostgreSQL (`members.role`) | JWT token payload | Read-committed with token refresh | Server token verification on protected mutation endpoints |
| **Events & Schedules** | PostgreSQL (`events`) | Client IndexedDB / SWR | Eventual Consistency | Server-wins on conflict; offline changes replayed with optimistic UI |
| **Donations & Payments** | PostgreSQL (`donations`) | Razorpay Gateway (external) | Strong (ACID Transactions) | Razorpay webhook cryptographic verification is authoritative |
| **Tax Receipts (80G)** | PostgreSQL (`receipts`) | S3/Cloudinary PDF storage | Immutable write-once | Immutable generated hash; regenerated only upon authorized amendment |
| **Sermon Catalog** | PostgreSQL (`sermons`) | Search index / Client cache | Eventual Consistency | PostgreSQL primary; SWR cached at edge |
| **AI Conversations** | PostgreSQL (`ai_chat_logs`) | FastMemory in Python process | Append-only / Eventual | PostgreSQL audit log is permanent record |
| **Offline Sync Queue** | Client IndexedDB | PostgreSQL target tables | Replicated Queue | Client generates UUID; server applies idempotently using operation key |

## 2. Cross-Database Synchronization & Isolation
- **No Shared Dual Writes**: PostgreSQL owns all transactional domain records. MongoDB is never written to as a duplicate primary store for relational data.
- **Cache Invalidation Flow**:
  1. Primary update committed to PostgreSQL in a transaction.
  2. Associated Redis key deleted or published to invalidation channel.
  3. Client fetches fresh record upon next request or SWR revalidation.
