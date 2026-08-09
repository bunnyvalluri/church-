# Network Resilience & Offline Architecture Report

## 1. Problems Found
- **Flaky Connection Handling**: Relying solely on `navigator.onLine` caused false positives when Wi-Fi or mobile data was connected to an access point without actual internet access.
- **Uncontrolled Retries on Failed API Calls**: Network failures or server timeouts would cause application components to crash or freeze.
- **Unintended Caching of Payment Requests**: Standard caching strategies risks caching sensitive payment or auth responses.

## 2. Root Cause
- `navigator.onLine` only checks local network adapter connectivity, not end-to-end backend availability.
- Absence of unified request cancellation (`AbortController`) and standardized HTTP error code handling.

## 3. Fix Implemented
- Built centralized `network-manager.ts` with real API health pings against `/api/health` and lightweight static HEAD requests.
- Classified 5 connection states: `ONLINE`, `SLOW_NETWORK`, `BACKEND_UNAVAILABLE`, `OFFLINE`, `SYNCING`.
- Built `apiClient.ts` with built-in `AbortController` timeouts (10s), idempotent GET retries, deduplication of concurrent requests, and structured 4xx/5xx user error messages.
- Configured Service Worker (`sw.js`) with `Network-Only` (Zero Cache) policy for all payment endpoints (`/payments`, `/donations/verify`, `/razorpay`, `/stripe`).
- Created non-intrusive `OfflineBanner.tsx` alerting users when offline or operating in degraded network mode.

## 4. Files Changed
- [network-manager.ts](file:///c:/K.C.M-Portal/frontend/lib/offline/network-manager.ts)
- [apiClient.ts](file:///c:/K.C.M-Portal/frontend/lib/apiClient.ts)
- [sw.js](file:///c:/K.C.M-Portal/frontend/public/sw.js)
- [OfflineBanner.tsx](file:///c:/K.C.M-Portal/frontend/components/ui/OfflineBanner.tsx)

## 5. Browser / Device Affected
- All mobile browsers switching between Wi-Fi and Cellular Data (5G/4G/3G).

## 6. Testing Performed
- Offline mode toggle simulation in browser dev tools.
- Network throttling (Slow 3G / Fast 3G) verification.
- Backend server downtime health check handling.

## 7. Remaining Limitations
- Live WebSocket notifications require an active TCP connection and cannot be received while fully offline.
