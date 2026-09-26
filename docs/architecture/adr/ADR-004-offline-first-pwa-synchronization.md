# ADR-004: Offline-First PWA with IndexedDB Transaction Buffering

## Status
`ACCEPTED`

## Context
Church members and field volunteers frequently operate in low or intermittent connectivity environments (rural prayer visits, field outreach, Sunday service auditoriums).

## Decision
Implement an offline-first PWA architecture:
- Workbox Service Worker caches static assets and public content.
- User drafts (prayer requests, volunteer attendance check-ins) buffer into client-side IndexedDB (`kcm_offline_store`).
- Upon online detection, the background sync engine posts batches with UUID nonces to `/api/sync/offline` with server timestamp authority.

## Consequences
- **Positive**: Zero data loss for field workers, instant optimistic UI rendering.
- **Negative**: Requires conflict resolution and schema versioning in IndexedDB.
