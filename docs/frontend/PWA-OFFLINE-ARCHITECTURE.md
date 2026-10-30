# KCM Church — PWA & Offline-First Architecture

**Engine**: [`frontend/src/pwa/`](file:///C:/K.C.M-Portal/frontend/src/pwa) & [`frontend/src/features/offline-sync/`](file:///C:/K.C.M-Portal/frontend/src/features/offline-sync)

---

## 1. PWA Manifest & App Shell
* **Manifest**: [`frontend/public/manifest.json`](file:///C:/K.C.M-Portal/frontend/public/manifest.json) configured for standalone display, `#ffffff` background, and `#6D28D9` theme color.
* **App Shell Pre-caching**: Core pages (`/`, `/sermons`, `/events`, `/prayer`, `/offline`) and SVG icons are cached for immediate offline launch.

---

## 2. Offline Mutation Queue & Background Sync
1. When offline, user interactions (e.g. prayer submissions, QR check-ins) are captured by `OfflineSyncManager.enqueueMutation`.
2. Each mutation records an optimistic `clientVersion` (version tracking) and timestamp.
3. When the browser regains connectivity (`window.addEventListener('online')`), `OfflineSyncManager.synchronize()` batches pending items to `POST /api/offline-sync/push`.
4. The server validates versions and reconciles data without destructive overwrite.
5. In-flight status is visualized via the `SyncStatusBadge` component.

---

## 3. Security Boundary
* **Rule**: Financial transactions (Razorpay donations) are **never** stored offline or retried automatically. Payments require live TLS handshakes.

