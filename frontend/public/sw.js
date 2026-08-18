// Kingdom of Christ Ministries Service Worker — Enterprise Offline-First Edition
const CACHE_VERSION = "v4";
const STATIC_CACHE_NAME = `kcm-static-${CACHE_VERSION}`;
const PUBLIC_CONTENT_CACHE = `kcm-public-content-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/offline"
];

// Install event — Cache core static shell and offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[SW] Cache installation notice:", err))
  );
});

// Activate event — Clean outdated legacy caches
self.addEventListener("activate", (event) => {
  const allowedCaches = [STATIC_CACHE_NAME, PUBLIC_CONTENT_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (!allowedCaches.includes(name)) {
              console.log("[SW] Purging outdated cache:", name);
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Helper: Check if a path is private / authenticated
function isPrivatePath(pathname) {
  return (
    pathname.startsWith("/member") ||
    pathname.startsWith("/pastor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/event-manager") ||
    pathname.startsWith("/event-management") ||
    pathname.startsWith("/church-member") ||
    pathname.startsWith("/memberships") ||
    pathname.startsWith("/field-volunteer") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/member") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/pastor") ||
    pathname.startsWith("/api/event-manager") ||
    pathname.startsWith("/api/field-volunteer") ||
    pathname.startsWith("/api/donations") ||
    pathname.startsWith("/api/payments") ||
    pathname.includes("/razorpay") ||
    pathname.includes("/stripe") ||
    pathname.includes("/webhook")
  );
}

// Fetch event router with secure caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1. STRICT NETWORK ONLY for private/auth/payment endpoints
  // Never cache sensitive user data or authentication tokens in service worker cache
  if (isPrivatePath(url.pathname)) {
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request).catch(() => {
          return caches.match("/offline").then((cachedOffline) => {
            return cachedOffline || caches.match("/");
          });
        })
      );
    }
    return; // Let browser perform direct network fetch for API requests
  }

  // 2. CACHE FIRST Strategy for static assets, fonts, icons, images
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif|woff|woff2|ttf|css|js)$/i) ||
    url.origin.includes("images.unsplash.com") ||
    url.origin.includes("res.cloudinary.com")
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

  // 3. STALE WHILE REVALIDATE for public content (sermons, events, gallery, ngo, about)
  if (
    url.pathname.startsWith("/sermons") ||
    url.pathname.startsWith("/events") ||
    url.pathname.startsWith("/gallery") ||
    url.pathname.startsWith("/ngo") ||
    url.pathname.startsWith("/about") ||
    url.pathname.startsWith("/prayer") ||
    url.pathname.startsWith("/give") ||
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

  // 4. Default Navigation Strategy (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match("/offline").then((offlinePage) => {
            return offlinePage || caches.match("/");
          });
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
