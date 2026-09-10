# KCM Portal — Comprehensive Authentication Security Specification

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  

---

## 1. Authentication Architecture Overview

The KCM Portal implements a dual-layer authentication architecture combining Edge Cryptographic Token Verification and Authoritative Server-Side Database Session Validation:

```text
[ User Client ]
      │  (POST /api/auth/login with credentials or Google OAuth)
      ▼
[ Edge Middleware ]
      │  • Validates origin / CSRF headers
      │  • Decodes & verifies HMAC-SHA256 signature using crypto.subtle (0ms)
      ▼
[ Route Handler / API ]
      │  • Validates payload using Zod (email, password complexity)
      │  • Constant-time Bcrypt hash comparison ($2a$12)
      │  • Generates cryptographically secure session ID
      ▼
[ Neon PostgreSQL ]
      │  • Stores active session record in `Session` table
      │  • Binds user ID, role, IP hash, user agent, expiration
      ▼
[ Client Set-Cookie ]
      • Attaches `kcm_session` (HttpOnly, Secure, SameSite=Lax, Max-Age: 7 days)
```

---

## 2. Password Security & Storage

1. **Hashing Algorithm:** Bcrypt with cost factor 12 (`$2a$12$`).
2. **Timing Side-Channel Protection:**
   - When a login attempt is made with an unregistered email, the server computes a comparison against `DUMMY_BCRYPT_HASH` (`$2a$12$e8Y9nZvZJ27Z6b2jW9fHq.U8k8zH6a4L3j2h1g0f9e8d7c6b5a4s3`) to ensure execution time is constant, preventing account enumeration via response time analysis.
3. **Password Complexity Requirements (`registerSchema`):**
   - Minimum 8 characters, maximum 128 characters.
   - At least one uppercase letter (`/[A-Z]/`).
   - At least one numeric digit (`/[0-9]/`).
   - At least one special character (`/[^A-Za-z0-9]/`).
4. **Credential Leakage Prevention:**
   - Password fields are explicitly stripped in Prisma selects (`select: { id: true, name: true, email: true, role: true }`).
   - Never logged to console, never stored in localStorage, and never included in telemetry payloads.

---

## 3. Brute-Force & Rate-Limiting Defenses

- **Login Route:** Enforces an IP and account rate limit of **5 requests per 15 minutes** using Token Bucket algorithm in `lib/rateLimit.ts` and Upstash Redis.
- **Registration Route:** Enforces **5 requests per 15 minutes** per IP.
- **Password Reset:** Enforces **3 requests per 30 minutes** with short-lived (15 min) single-use cryptographically signed tokens.

---

## 4. Session Lifetime & Revocation

- **Session Invalidation on Password Change:**
  - `revokeAllUserSessions(userId)` marks all existing sessions as revoked in the database (`revokedAt = new Date()`), forcing immediate re-authentication across all user devices.
- **Sliding Activity Window:**
  - Active sessions refresh their `lastActivityAt` timestamp every 15 minutes, allowing active members to remain logged in while inactive sessions expire after 7 days.
