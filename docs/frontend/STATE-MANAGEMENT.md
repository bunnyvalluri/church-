# KCM Church — State Management Architecture

The platform separates state into three clear architectural domains:

---

## 1. Server State (TanStack React Query)
* **Engine**: `@tanstack/react-query` configured in [`frontend/components/providers/index.tsx`](file:///C:/K.C.M-Portal/frontend/components/providers/index.tsx).
* **Strategy**:
  * Default `staleTime: 5 * 60 * 1000` (5 minutes).
  * `refetchOnWindowFocus: false` to conserve bandwidth on mobile cellular connections.
  * Optimistic cache updates during member event registrations.

---

## 2. Global Client State (Reactive Stores)
* **Engine**: [`frontend/src/stores/index.ts`](file:///C:/K.C.M-Portal/frontend/src/stores/index.ts).
* **Use Cases**:
  * Mobile sidebar drawer open/close status.
  * Active dialog modal reference.
  * Active campus branch filter (`selectedCampusId`).
* **Implementation**: Lightweight Observer pattern (`SimpleStore`) with zero external dependency bloat.

---

## 3. Persistent Offline State (OfflineSyncManager)
* **Engine**: [`frontend/src/features/offline-sync/syncManager.ts`](file:///C:/K.C.M-Portal/frontend/src/features/offline-sync/syncManager.ts).
* **Storage**: LocalStorage & IndexedDB (`kcm_pending_mutations_v3`).
* **Use Cases**: Offline check-ins, prayer requests, field notes.
* **Security**: Payment secrets and session tokens are **never** persisted to offline mutation queues.
