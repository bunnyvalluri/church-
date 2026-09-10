# KCM Portal — Comprehensive API Security & Hardening Specification

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  

---

## 1. API Security Architecture

The KCM API surface consists of over 40 Next.js serverless route handlers (`frontend/app/api/**`). Every route is hardened across six defensive layers:

```text
[ Incoming Request ]
        │
1. Edge Middleware (HTTPS Check, Host Whitelist, CSRF Origin Validation)
        │
2. Rate Limiting (Token Bucket per IP / Account)
        │
3. Authentication & RBAC (Session Resolution, Role Verification)
        │
4. Input Validation (Zod Schema, Sanitization via sanitize-html)
        │
5. Business Logic & Database Operation (Prisma Parameterized Query)
        │
6. Sanitized Response (Zero Stack Traces, Filtered Output)
```

---

## 2. Defensive Controls Implemented

### 2.1 CSRF Defense on State-Changing Endpoints
In `frontend/middleware.ts`, all state-changing HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`) targeting `/api/*` undergo origin and referer verification against trusted origins:
- `kcmchurch.vercel.app`
- `*.vercel.app`
- `localhost` / `127.0.0.1`
Requests presenting an untrusted or mismatched origin header are immediately rejected with HTTP 403 Forbidden.

### 2.2 Input Validation & Strict Typing
- All endpoint inputs are validated using strict Zod schemas with upper bounds on string lengths (e.g. `max(254)` on email, `max(128)` on password, `max(50)` on names).
- Inputs containing markup are stripped of executable tags via `sanitize-html`.

### 2.3 Resilient External Service Dispatch (Companion Decoupling)
- External webhook and companion notifications are dispatched using `safeTriggerCompanionEvent` with a **1500ms AbortController timeout**.
- If external services fail or are offline, primary API requests complete successfully without crashing or delaying end users.

### 2.4 Error Sanitization & Information Leakage Prevention
- In production, unhandled exceptions return generic messages:
  `{ "error": "An internal error occurred. Please try again later." }`
- Full stack traces, SQL error strings, and file system paths are logged exclusively to server logs with unique correlation IDs.
