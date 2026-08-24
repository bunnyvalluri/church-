# Kingdom of Christ Ministries (KCM) — MongoDB Atlas Architecture Guide

**Document Version**: 1.0.0  
**Target Audience**: Backend Engineers, Data Architects, DevOps, SREs

---

## 1. Architectural Purpose

MongoDB Atlas is integrated as a complementary, high-throughput document database within the KCM platform. Its core mandate is to handle high-velocity, append-mostly workloads that would otherwise create read/write contention and bloated tables in the transactional PostgreSQL database.

### Why MongoDB?
- **Unstructured / Semi-Structured Event Payloads**: Flexible schema evolution for dynamic event metadata, audit diffs, and device payloads.
- **High-Throughput Ingestion**: Non-blocking ingestion of client activity logs, telemetry snapshots, and streaming metrics.
- **Time-to-Live (TTL) Native Expiration**: Built-in automated data lifecycle management that purges ephemeral logs without costly manual PostgreSQL partition pruning.
- **Compound Geospatial & Time-Series Indexing**: Optimized compound indexes for fast cursor-based pagination and analytical queries.

---

## 2. Target Collections & Detailed Schemas

### 2.1 `activity_logs`
Tracks user, admin, and background actions across the portal.

```json
{
  "_id": "ObjectId(...)",
  "actorId": "cly1234567890",
  "actorRole": "MEMBER",
  "actorEmail": "member@kcmchurch.com",
  "action": "SERMON_PLAYED",
  "entityType": "sermon",
  "entityId": "sermon_987654",
  "metadata": {
    "title": "Walking in Divine Faith",
    "durationSeconds": 342,
    "quality": "1080p"
  },
  "ipHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "createdAt": "2026-08-24T21:40:00.000Z"
}
```

### 2.2 `audit_events`
Immutable security and administrative compliance records.

```json
{
  "_id": "ObjectId(...)",
  "eventId": "evt_7f8a9b0c-1234-5678-9abc-def012345678",
  "actorId": "admin_cuid123",
  "actorRole": "SUPER_ADMIN",
  "action": "ROLE_ELEVATION",
  "resource": "user",
  "resourceId": "member_cuid456",
  "beforeState": {
    "role": "MEMBER"
  },
  "afterState": {
    "role": "EVENT_MANAGER"
  },
  "metadata": {
    "reason": "Appointed head of youth festival committee"
  },
  "ipHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "createdAt": "2026-08-24T21:40:00.000Z"
}
```

### 2.3 `notification_events`
Multi-channel notification dispatch records with delivery state machines.

```json
{
  "_id": "ObjectId(...)",
  "eventId": "notif_evt_889900",
  "recipientId": "member_cuid456",
  "recipientRole": "MEMBER",
  "recipientAddress": "+91 96409 *****",
  "channel": "PUSH",
  "title": "Sunday Healing Service Starts in 1 Hour",
  "body": "Join us live at Shapur Nagar Campus or via online stream.",
  "payload": {
    "eventId": "ev_healing_aug2026",
    "link": "/live"
  },
  "status": "DELIVERED",
  "attempts": 1,
  "maxAttempts": 3,
  "provider": "firebase-fcm",
  "providerMessageId": "projects/kcm-church/messages/0:1234567890",
  "createdAt": "2026-08-24T20:00:00.000Z",
  "processedAt": "2026-08-24T20:00:01.000Z",
  "deliveredAt": "2026-08-24T20:00:02.000Z"
}
```

### 2.4 `system_events`
Domain event streams and background loop execution snapshots.

```json
{
  "_id": "ObjectId(...)",
  "eventId": "sys_evt_998877",
  "eventType": "event.created",
  "aggregateType": "Event",
  "aggregateId": "ev_youth_revival_2026",
  "payload": {
    "title": "Youth Revival 2026",
    "branch": "Shapur Nagar",
    "capacity": 500
  },
  "source": "kcm-frontend-nextjs",
  "correlationId": "corr_123456-abc-789",
  "createdAt": "2026-08-24T21:40:00.000Z"
}
```

### 2.5 `analytics_events`
High-volume interaction telemetry.

```json
{
  "_id": "ObjectId(...)",
  "eventName": "sermon_stream_heartbeat",
  "userId": "usr_cuid999",
  "sessionId": "sess_abc123",
  "properties": {
    "sermonId": "sermon_101",
    "playbackTimeSeconds": 600,
    "bitrate": "4Mbps",
    "device": "Mobile Safari"
  },
  "timestamp": "2026-08-24T21:40:00.000Z"
}
```

---

## 3. Production Index Strategy

| Collection | Index Specification | Index Type | Purpose / Query Pattern |
| :--- | :--- | :--- | :--- |
| `activity_logs` | `{ actorId: 1, createdAt: -1 }` | Compound | Member personal activity stream |
| `activity_logs` | `{ entityType: 1, entityId: 1, createdAt: -1 }` | Compound | Entity audit timeline |
| `activity_logs` | `{ createdAt: -1 }` | Standard | Admin global activity feed |
| `activity_logs` | `{ createdAt: 1 }` | TTL (365 days) | Automatic rolling annual log cleanup |
| `audit_events` | `{ eventId: 1 }` | Unique | Idempotency & duplicate suppression |
| `audit_events` | `{ actorId: 1, createdAt: -1 }` | Compound | User audit queries |
| `audit_events` | `{ resource: 1, resourceId: 1, createdAt: -1 }` | Compound | Resource change history |
| `audit_events` | `{ createdAt: -1 }` | Standard | Security compliance timeline |
| `notification_events` | `{ eventId: 1 }` | Unique | Idempotency |
| `notification_events` | `{ recipientId: 1, status: 1, createdAt: -1 }` | Compound | User inbox and unread counts |
| `notification_events` | `{ status: 1, attempts: 1, createdAt: 1 }` | Compound | Worker retry polling |
| `notification_events` | `{ createdAt: 1 }` | TTL (90 days) | Notification history cleanup |
| `system_events` | `{ eventId: 1 }` | Unique | Idempotency |
| `system_events` | `{ eventType: 1, aggregateId: 1, createdAt: -1 }` | Compound | Domain event replay |
| `system_events` | `{ correlationId: 1 }` | Standard | End-to-end trace queries |
| `analytics_events` | `{ eventName: 1, timestamp: -1 }` | Compound | Event metric rollups |
| `analytics_events` | `{ userId: 1, timestamp: -1 }` | Compound | User behavior analysis |
| `analytics_events` | `{ timestamp: 1 }` | TTL (180 days) | Analytics data lifecycle bound |

---

## 4. Connection Pooling & Lifecycle Management

The `MongoClient` connection is managed as a **singleton instance** across process runtimes:
- **Connection Pooling**:
  - `minPoolSize`: 5 connections
  - `maxPoolSize`: 50 connections in production (10 in dev)
  - `maxIdleTimeMS`: 30000ms
  - `serverSelectionTimeoutMS`: 5000ms
  - `connectTimeoutMS`: 10000ms
- **Development Resilience (`MONGODB_OFFLINE="true"`)**:
  - When active, the client intercepts queries and returns safe mock empty sets or in-memory arrays, allowing developers to build and test frontend components without an active Atlas connection.
- **Graceful Process Termination**:
  - Registered shutdown hooks cleanly drain in-flight operations and close socket pools upon `SIGTERM` or `SIGINT`.

---

## 5. Security & Network Restrictions

1. **Authentication & Access**:
   - Connection strings use standard SCRAM-SHA-256 or X.509 certificate authentication.
   - Dedicated database users configured with `readWrite` access restricted solely to the `kcm_church` database.
2. **Network Isolation**:
   - Production access restricted via MongoDB Atlas IP Access Lists / AWS VPC Peering.
3. **Zero Secrets in Frontend**:
   - `MONGODB_URI` and `MONGODB_DATABASE_NAME` are strictly server-side environment variables. No `NEXT_PUBLIC_` prefixes are permitted.
4. **Data Sanitization**:
   - Client IPs are hashed via SHA-256 before insertion.
   - All input documents pass Zod schema validation before repository execution.

---

## 6. Backup & Disaster Recovery Strategy

1. **Continuous Cloud Backups**:
   - Point-in-Time Recovery (PITR) enabled on MongoDB Atlas cluster (7-day granular restore window).
   - Daily automated snapshots retained for 30 days.
2. **PostgreSQL Decoupling**:
   - In the event of a catastrophic MongoDB outage, all core church services (donations, auth, registrations, sermon playback) continue uninterrupted with PostgreSQL.
