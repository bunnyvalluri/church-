# KCM Offline-First Storage & Synchronization Architecture

## 1. Client-Side Persistence Architecture (IndexedDB)
The PWA and mobile interface employ an offline-first transactional pipeline:

```
[User Action in Browser / PWA]
             |
             v
[Optimistic UI Update & Toast]
             |
             v
[Write to Local IndexedDB ('kcm-offline-db')]
             |
     (Network Online?)
      ├── YES ──> [Send HTTP POST with Idempotency Key] ──> [Server DB Commit] ──> [Mark Synced in IndexedDB]
      └── NO  ──> [Enqueue in Pending Mutations Table]   ──> [Wait for 'online' event] ──> [Background Retry Engine]
```

## 2. Sync Queue Schema in IndexedDB
- **Database**: `kcm-offline-db` (Version 2)
- **Object Stores**:
  - `pending_mutations`: `{ id: UUID, endpoint: string, method: string, payload: any, idempotencyKey: string, createdAt: timestamp, status: 'PENDING' | 'SYNCED' | 'FAILED' }`
  - `cached_events`: Cached event listings for offline browsing
  - `cached_sermons`: Cached sermon catalogs and audio metadata

## 3. Conflict Resolution & Idempotency
1. **Server-Authoritative Conflict Strategy**:
   - If an event fills up while a user was offline, the server returns `409 Conflict` with reason `SEATS_EXHAUSTED`. The client handles this gracefully by notifying the user without corrupting local state.
2. **Deterministic Mutation Idempotency**:
   - Every mutation payload includes a client-generated UUID `idempotencyKey`. If a network glitch causes repeated transmissions, the server recognizes the key and returns the existing result without creating duplicate records.
