// Kingdom of Christ Ministries Service Worker — Enterprise Offline-First Edition
const CACHE_VERSION = "v3";
const STATIC_CACHE_NAME = `kcm-static-${CACHE_VERSION}`;
const PUBLIC_CONTENT_CACHE = `kcm-public-content-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `kcm-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/globals.css",
  "/favicon.ico",
  "/offline"
];

// Install event — Cache core static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[SW] Cache installation warning:", err))
  );
});

// Activate event — Clean legacy caches
self.addEventListener("activate", (event) => {
  const allowedCaches = [STATIC_CACHE_NAME, PUBLIC_CONTENT_CACHE, DYNAMIC_CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (!allowedCaches.some((allowed) => name.startsWith(allowed.split("-v")[0]))) {
              console.log("[SW] Purging outdated cache:", name);
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event router with granular caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1. NETWORK ONLY Strategy
  // Never cache payment endpoints, webhooks, passwords, or sensitive auth calls
  if (
    url.pathname.includes("/payments") ||
    url.pathname.includes("/donations/verify") ||
    url.pathname.includes("/razorpay") ||
    url.pathname.includes("/stripe") ||
    url.pathname.includes("/auth/reset-password") ||
    url.pathname.includes("/webhook")
  ) {
    return; // Default network fetch
  }

  // 2. CACHE FIRST Strategy for static assets, fonts, icons, images
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|css|js)$/i) ||
    url.origin.includes("images.unsplash.com")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. STALE WHILE REVALIDATE Strategy for public content (sermons, events, gallery, ngo)
  if (
    url.pathname.startsWith("/sermons") ||
    url.pathname.startsWith("/events") ||
    url.pathname.startsWith("/gallery") ||
    url.pathname.startsWith("/ngo") ||
    url.pathname.startsWith("/about") ||
    url.pathname.startsWith("/api/events") ||
    url.pathname.startsWith("/api/sermons") ||
    url.pathname.startsWith("/api/gallery") ||
    url.pathname.startsWith("/api/ngo")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(PUBLIC_CONTENT_CACHE).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. NETWORK FIRST Strategy for dynamic member/admin/pastor routes
  if (
    url.pathname.startsWith("/member") ||
    url.pathname.startsWith("/pastor") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/event-manager") ||
    url.pathname.startsWith("/api/")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (request.mode === "navigate") {
              return caches.match("/");
            }
            return new Response(JSON.stringify({ offline: true, error: "Network unavailable" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          });
        })
    );
    return;
  }

  // 5. Default Navigation Strategy
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match("/");
        });
      })
    );
  }
});

// Background Sync Listener
self.addEventListener("sync", (event) => {
  if (event.tag === "kcm-offline-sync") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "TRIGGER_SYNC" });
        });
      })
    );
  }
});

// Message listener for skipWaiting or manual sync
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
