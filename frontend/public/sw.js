// Kingdom of Christ Ministries Service Worker — Enterprise Offline-First Edition (v6)
// Hardened for Cross-Browser Compatibility, Scheme Validation & Extension Safety

const CACHE_VERSION = "v6";
const STATIC_CACHE_NAME = `kcm-static-${CACHE_VERSION}`;
const PUBLIC_CONTENT_CACHE = `kcm-public-content-${CACHE_VERSION}`;
const ALLOWED_CACHES = [STATIC_CACHE_NAME, PUBLIC_CONTENT_CACHE];

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/offline"
];

// Whitelisted external asset domains (images / fonts only)
const WHITELISTED_EXTERNAL_ORIGINS = [
  "https://images.unsplash.com",
  "https://res.cloudinary.com"
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

// Activate event — Safely clean outdated legacy caches belonging to this application
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            // Only prune caches matching the 'kcm-' prefix to avoid clearing unrelated caches
            if (name.startsWith("kcm-") && !ALLOWED_CACHES.includes(name)) {
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

// Helper: Validate whether a request and response can be safely cached via Cache API
function isCacheable(request, response) {
  if (!request || !response) return false;
  if (request.method !== "GET") return false;

  try {
    const parsedUrl = new URL(request.url);
    // The Cache API only supports http: and https: request schemes.
    // Chrome extensions (chrome-extension://), Firefox extensions (moz-extension://),
    // browser internals (chrome://, devtools://, about:), and non-network schemes (data:, blob:, file:)
    // are strictly unsupported by the Cache API and will throw TypeError on cache.put().
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }
  } catch {
    return false;
  }

  // Only cache successful 200 OK responses with basic or cors type.
  // Never cache opaque (type 0), error, or partial responses in persistent static caches.
  if (response.status !== 200) return false;
  if (response.type !== "basic" && response.type !== "cors") return false;

  return true;
}

// Helper: Safe Cache Put operation with defensive checks and error handling
function safeCachePut(cacheName, request, response) {
  if (!isCacheable(request, response)) {
    return Promise.resolve();
  }

  const responseToCache = response.clone();
  return caches
    .open(cacheName)
    .then((cache) => cache.put(request, responseToCache))
    .catch((err) => {
      // Prevent unhandled promise rejections while logging in local development
      if (self.location.hostname === "localhost") {
        console.warn("[SW] Cache.put warning for", request.url, err);
      }
    });
}

// Fetch event router with secure caching strategies & strict scheme validation
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 1. Check HTTP Method: Cache API only handles GET requests
  if (!request || request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return; // Unparseable URL, let browser handle natively
  }

  // 2. STRICT SCHEME VALIDATION:
  // Only handle http: and https: protocols.
  // Immediately bypass chrome-extension://, moz-extension://, chrome://, devtools://, data:, blob:, file:, etc.
  // Browser extensions and browser-internal fetches will bypass the SW and complete normally.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;

  // 3. STRICT NETWORK ONLY for private/auth/payment endpoints (Same-origin only)
  // Never cache sensitive user data or authentication tokens in service worker cache
  if (isSameOrigin && isPrivatePath(url.pathname)) {
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

  // 4. CACHE FIRST Strategy for immutable assets, fonts, icons, images, and next.js static chunks
  // Restrict to same-origin static chunks or explicitly whitelisted image CDNs
  const isStaticAsset =
    (isSameOrigin && (
      url.pathname.startsWith("/_next/static/") ||
      url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif|woff|woff2|ttf|ico)$/i)
    )) ||
    WHITELISTED_EXTERNAL_ORIGINS.includes(url.origin);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          safeCachePut(STATIC_CACHE_NAME, request, networkResponse);
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. STALE WHILE REVALIDATE for SAME-ORIGIN scripts and stylesheets ONLY
  // Third-party scripts (e.g. Google Auth, Firebase, YouTube, Razorpay) and extension scripts
  // MUST NOT be intercepted or cached into the application's static cache
  if (isSameOrigin && url.pathname.match(/\.(css|js)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            safeCachePut(STATIC_CACHE_NAME, request, networkResponse);
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 6. STALE WHILE REVALIDATE for SAME-ORIGIN public content (sermons, events, gallery, ngo, about)
  const isPublicContent =
    isSameOrigin && (
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
    );

  if (isPublicContent) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            safeCachePut(PUBLIC_CONTENT_CACHE, request, networkResponse);
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 7. DEFAULT NAVIGATION Strategy for same-origin HTML pages
  if (request.mode === "navigate" && isSameOrigin) {
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
    return;
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
