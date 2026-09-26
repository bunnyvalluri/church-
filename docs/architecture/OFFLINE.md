# KCM Portal — Offline-First & PWA Synchronization Architecture

## 1. PWA Service Worker & Cache Hierarchy

The platform implements an offline-first architecture via Workbox and custom Service Worker logic (`frontend/public/sw.js`):
- **Cache-First Strategy**: Static assets, fonts, app shell (`/_next/static/*`, `/icons/*`, `/manifest.json`).
- **Stale-While-Revalidate**: Public sermons, events, leadership directory, and i18n translation bundles.
- **Network-Only**: Authenticated payments, donation checkouts, and password resets.

---

## 2. IndexedDB Transaction Queue & Reconciliation

```
+-----------------------------------------------------------------------------------+
|                        OFFLINE SYNCHRONIZATION ENGINE                             |
|                                                                                   |
|  [ User in Low/No Connectivity Area ]                                             |
|        |                                                                          |
|        +---> Submits Prayer Request or Attendance Check-in                        |
|        |                                                                          |
|        v                                                                          |
|  [ IndexedDB `kcm_offline_store` ] (Persisted with UUID nonce & Timestamp)        |
|        |                                                                          |
|        | (Browser fires `online` event)                                           |
|        v                                                                          |
|  [ Background Sync Worker ] (`/api/sync/offline`)                                 |
|        |                                                                          |
|        +---> Validates Nonces & Deduplicates                                      |
|        +---> Commits to PostgreSQL                                                |
|        +---> Returns Confirmation -> IndexedDB Queue Flushed                      |
+-----------------------------------------------------------------------------------+
```
