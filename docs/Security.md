# KCM Security Blueprint & Controls

## 1. Authentication & Session Defense
- **Session Tokens**: Created and verified using `HMAC-SHA256` signatures via Web Crypto API in Edge Middleware.
- **Cookies**: `HttpOnly`, `Secure`, `SameSite=Lax`, with short-lived expiration and instant revocation upon logout.
- **Brute Force Protection**: In-memory rate limiting and Edge IP throttling on all authentication routes (`/api/auth/*`).

---

## 2. API Authorization & RBAC
- **Server Enforcement**: All mutation and data access routes perform direct role checks against the cryptographically verified session token.
- **Role Hierarchy**:
  - `SUPER_ADMIN` > `ADMIN` > `PASTOR` > `EVENT_MANAGER` > `FIELD_VOLUNTEER` > `MEMBER`
- **Zero Client Trust**: Browser localStorage states are treated solely as UI display hints and are never trusted for data access.

---

## 3. Webhook & Payment Security
- **HMAC Verification**: Razorpay (`x-razorpay-signature`) and Stripe webhooks require cryptographic HMAC verification before processing.
- **Deduplication**: Webhook payloads are hashed with SHA-256 and matched against processed event IDs to prevent replay attacks.
- **No Client Manipulation**: Donation amounts, receipts, and 80G tax status are calculated and verified exclusively on the server.

---

## 4. Security Headers & CSP
- **Content Security Policy**:
  - Strict script-src with authorized CDNs (Razorpay, Google, Firebase, YouTube, Vercel).
  - Explicit frame-ancestors `'self'`.
  - Object-src `'none'`.
- **HSTS**: `max-age=63072000; includeSubDomains; preload`
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restricted camera/mic/geolocation with explicit payment gateway delegations.
