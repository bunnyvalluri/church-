# KCM Portal — Frontend Architecture Specification

## 1. Overview & Framework Structure

The KCM Church frontend is built on **Next.js 14** using the App Router (`frontend/app/`):
- **Server Components**: Leveraged for static metadata, SEO, schema.org graphs, and pre-rendered SSG routes (`/`, `/events`, `/sermons`, `/locations/*`).
- **Client Components (`'use client'`)**: Isolated strictly to interactive elements (Modals, Forms, Camera Capture, Live Socket alerts, Theme Toggle).
- **Route Groups & Sub-Portals**:
  - `/(public)`: Public marketing, sermons, worship, NGO, contact, give.
  - `/member/*`: Member dashboard, prayer requests, giving receipts, personal profile.
  - `/pastor/*`: Pastor administration, branch reports, flock analytics, openclaw orchestrator.
  - `/event-manager/*`: Volunteer scheduling, ticket scans, attendance rosters.

---

## 2. State Management Strategy

```
+-----------------------------------------------------------------------------------+
|                        FRONTEND STATE HIERARCHY                                   |
|                                                                                   |
|  1. URL / SearchParams State   --> Active tab, date range, pagination, branch slug|
|  2. Server Cache State (SWR)   --> Events, sermons, prayers, live statistics     |
|  3. Local UI Component State   --> Form inputs, modal toggles, dropdowns          |
|  4. Persistent Browser State   --> `kcm-theme` (light/dark), `kcm-selected-branch`|
|  5. Offline Storage (IndexedDB)--> Unsynchronized drafts, offline transactions    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Custom Hooks Architecture

All complex asynchronous or side-effect logic is encapsulated in custom hooks located in `frontend/hooks/`:
- `useEvents`: Fetches and caches church calendar schedules with branch filter support.
- `useEventSocket`: Real-time Socket.io listener for new events and broadcast alerts.
- `useOfflineDraft`: Automatically buffers form drafts in IndexedDB to prevent data loss.
- `useProtectedRoute`: Enforces client-side session checks and role validation.
- `useNetworkStatus`: Detects browser online/offline status for PWA state transitions.
