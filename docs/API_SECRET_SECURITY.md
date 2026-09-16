# KCM Church — API Secret Security & Server-Side Enforcement

## Overview
This document specifies the server-side API defense architecture for Kingdom of Christ Ministries (KCM). In accordance with Zero-Trust principles, no client-provided role, identity, or status attribute is trusted without cryptographic or database validation on the server.

---

## 1. Zero-Trust Server-Side Validation

The backend enforces strict parameter and identity validation across all endpoints:

1. **Client Identity & Roles**:
   - The server **NEVER** trusts `role`, `isAdmin`, `isPastor`, or `permissions` values passed in request bodies or query parameters.
   - User identity and role are derived exclusively from the verified HMAC-SHA256 session token (`kcm_session`) or authenticated Firebase ID token on the server.

2. **Branch & Resource Ownership**:
   - When a user performs an action scoped to a branch (e.g., creating an event, viewing attendance, submitting reports), the backend checks whether the authenticated user's assigned branch or global role permits that action.
   - A member cannot modify or view another member's prayer requests or giving records by manipulating `memberId` or `donationId` parameters.

3. **Payment State Integrity**:
   - Client applications **CANNOT** self-report payment success to update database records.
   - All donation completions are verified server-side through Razorpay API signature verification (`crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)`) or signed webhook verification (`RAZORPAY_WEBHOOK_SECRET`).

---

## 2. Webhook Cryptographic Verification

All inbound webhook endpoints require HMAC cryptographic signature validation before processing any payload:

```
Inbound Request ──► [Extract Signature Header]
                           │
                           ▼
              [Compute HMAC-SHA256(RawBody, WebhookSecret)]
                           │
                           ▼
                  [crypto.timingSafeEqual]
                           ├── Match ──► Process Event & Update DB
                           └── Fail  ──► Return 401 Unauthorized
```

### Supported Webhook Handlers:
- **Razorpay**: `x-razorpay-signature` validated against `RAZORPAY_WEBHOOK_SECRET`.
- **Stripe**: `stripe-signature` validated via `stripe.webhooks.constructEvent` using `STRIPE_WEBHOOK_SECRET`.
- **httpSMS**: `x-signature` validated against `HTTPSMS_WEBHOOK_SECRET`.

---

## 3. Rate Limiting, CORS & CSRF Defense

1. **Rate Limiting**:
   - Edge Middleware and API routes enforce rate limits per IP and per user session:
     - General APIs: 100 requests per 15-minute sliding window.
     - Auth endpoints (`/api/auth/login`, `/api/auth/google`): 10 attempts per 15-minute window to prevent credential stuffing.
     - Donation checkout endpoints: 20 attempts per 15-minute window.

2. **CORS Restrictions**:
   - Strict `Access-Control-Allow-Origin` whitelist configured in `frontend/next.config.js`:
     - `https://kcmchurch.vercel.app`
     - `https://kingdomofchristministries.org`
     - `http://localhost:3000` (Dev only)
   - Wildcard origins (`*`) are prohibited on sensitive API endpoints.

3. **CSRF Protection**:
   - State-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) must originate from trusted domains verified by `Origin` and `Referer` header inspection in `middleware.ts`.
   - Webhook routes are explicitly whitelisted by cryptographic signature verification rather than domain origin.

4. **Sanitized Error Responses**:
   - Database error stacks, SQL query details, and internal file paths are stripped in production before sending JSON responses to clients.
   - Generic user-friendly error codes (`INTERNAL_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_FAILED`) are returned with sanitized messages.
