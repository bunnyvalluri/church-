# Service Worker Architecture & Operational Manual

## Document Details
- **Module**: `frontend/public/sw.js`
- **Registration**: `frontend/components/providers/ServiceWorkerProvider.tsx`
- **Current Version**: `v6`
- **Classification**: Mission-Critical Production Infrastructure

---

## 1. Overview & Strategy Inventory

The KCM Service Worker manages network resiliency, offline application availability, asset caching, and background synchronization while isolating browser extensions and third-party scripts.

### 1.1 Strategies by Route Type

| Route Type | URL Pattern | Caching Strategy | Cache Store | Security/Scheme Constraints |
| :--- | :--- | :--- | :--- | :--- |
| **Private / Auth** | `/member/*`, `/admin/*`, `/pastor/*`, `/api/auth/*`, `/api/payments/*` | `Network-Only` | None (Direct Network) | Never cached. Navigations fallback to `/offline` if offline. |
| **Static Bundles** | `/_next/static/*`, `*.(png\|webp\|svg\|woff2)` | `Cache-First` | `kcm-static-v6` | Same-origin or whitelisted CDNs (`res.cloudinary.com`, `images.unsplash.com`). |
| **Local Styles & Scripts** | `*.css`, `*.js` | `Stale-While-Revalidate` | `kcm-static-v6` | **STRICTLY same-origin**. Third-party scripts bypass SW. |
| **Public Content** | `/sermons`, `/events`, `/gallery`, `/ngo`, `/about` | `Stale-While-Revalidate` | `kcm-public-content-v6` | Same-origin only. |
| **HTML Navigation** | `request.mode === 'navigate'` | `Network-First` | Fallback to `/offline` | Same-origin only. |
| **Browser Extensions** | `chrome-extension://*`, `moz-extension://*` | **Bypassed completely** | None | Must never touch Service Worker cache. |

---

## 2. Scheme Validation & Safe Cache Put Implementation

```javascript
// Validates whether a request & response pair can be placed in Cache API
function isCacheable(request, response) {
  if (!request || !response) return false;
  if (request.method !== "GET") return false;

  try {
    const parsedUrl = new URL(request.url);
    // W3C Cache API specification: Scheme MUST be http: or https:
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }
  } catch {
    return false;
  }

  // Strictly cache HTTP 200 OK responses with basic or cors type
  if (response.status !== 200) return false;
  if (response.type !== "basic" && response.type !== "cors") return false;

  return true;
}

function safeCachePut(cacheName, request, response) {
  if (!isCacheable(request, response)) {
    return Promise.resolve();
  }

  const responseToCache = response.clone();
  return caches
    .open(cacheName)
    .then((cache) => cache.put(request, responseToCache))
    .catch((err) => {
      if (self.location.hostname === "localhost") {
        console.warn("[SW] Cache.put warning for", request.url, err);
      }
    });
}
```

---

## 3. Lifecycle & Cache Eviction

1. **Install (`self.skipWaiting()`)**:
   Pre-caches `/`, `/manifest.json`, `/logo.png`, and `/offline`.
2. **Activate (`self.clients.claim()`)**:
   Inspects `caches.keys()`. Any cache starting with `kcm-` that is not in `ALLOWED_CACHES` (`['kcm-static-v6', 'kcm-public-content-v6']`) is deleted immediately.
3. **Background Sync (`sync` event)**:
   Listens for `kcm-offline-sync` tag and notifies active clients to trigger `syncEngine.triggerSync()`.

---

## 4. Debugging & Verification Procedure

1. **Check Service Worker Status**:
   - Open Chrome DevTools -> `Application` -> `Service Workers`.
   - Verify Source is `sw.js` and status is `Activated and is running`.
2. **Inspect Cache Storage**:
   - Open Chrome DevTools -> `Application` -> `Cache Storage`.
   - Confirm active caches are named `kcm-static-v6` and `kcm-public-content-v6`.
   - Verify NO `chrome-extension://` requests appear in any cache store.
3. **Simulate Offline**:
   - Toggle `Offline` in Network tab or Application tab.
   - Navigate to any public route or refresh; verify `/offline` page loads gracefully.
