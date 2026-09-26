# KCM Database Tier Architecture

## 1. System Overview & Polyglot Persistence
The Kingdom of Christ Ministries platform leverages a purpose-built polyglot persistence architecture designed to balance strict relational data integrity with high-availability client operations.

```
+-----------------------------------------------------------------------------+
|                               Frontend Layer                                |
|          (Next.js 14 App Router, React Server Components, SWR / PWA)        |
+-----------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
      [ Server Actions / Route API ]          [ Offline IndexedDB Cache ]
                   |                                       |
                   v                                       v
      [ Domain Services & DAL ]               [ Background Sync Engine ]
                   |                                       |
  +----------------+----------------+                      |
  |                |                |                      |
  v                v                v                      |
[Neon PostgreSQL] [Upstash Redis]  [MongoDB Atlas]         |
(Primary Relational)(Cache & Pub/Sub)(Document Store)      |
  |                                                        |
  +--------------------------------------------------------+
```

## 2. Storage Roles & Ownership

| Technology | Role | Purpose & Data Owned |
| :--- | :--- | :--- |
| **PostgreSQL (Neon)** | **Primary System of Record** | Core relational state: Users, Roles, Events, Registrations, Donations, Pledges, Sermons, Attendance, Audit Logs, Security Events, and Webhook records. |
| **Upstash / Redis** | **Cache, Locks & Ephemeral State** | Session rate-limiting tokens, API response caches, distributed locks, BullMQ retry queues, and real-time Pub/Sub channels. |
| **MongoDB Atlas** | **Document Fallback / Analytics** | Unstructured content scrapings, external search feed dumps, and legacy document collections. |
| **Cloudinary** | **Blob / Media Storage** | Images, sermon PDFs, event banners, and high-resolution pastor profiles (URLs and public IDs stored in PostgreSQL). |
| **Client IndexedDB** | **Edge / Offline Store** | Client-side cached sermon metadata, offline prayer request drafts, and queued event registrations pending server sync. |

## 3. Serverless Connection Management & Pooling
- **Neon pgBouncer**: Production connections use Neon pooled connection URIs with `sslmode=require` and connection limits sized to prevent socket exhaustion during concurrent serverless execution spikes.
- **Singleton Client Pattern**: Managed via [frontend/lib/prisma.ts](file:///c:/K.C.M-Portal/frontend/lib/prisma.ts), preventing duplicate connection pools across Next.js API route invocations during development hot-reloading and production worker scaling.
