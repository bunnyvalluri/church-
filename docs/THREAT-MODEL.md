# KCM Portal — Comprehensive STRIDE Threat Model

**Threat Model Version:** 2.0.0  
**Scope:** Full-Stack Church Web Application (`https://kcmchurch.vercel.app`)  
**Methodology:** Microsoft STRIDE & OWASP Top 10 Framework  

---

## 1. Actor Archetypes & Trust Boundaries

```text
[ Anonymous Visitor ] ──► (Public Website, Sermons, Events, Prayer Request, Giving)
         │
[ Registered Member ] ──► (Member Portal, Giving History, Family Directory, Certificates)
         │
[ Field Volunteer ]   ──► (Event Check-In Scanner, Offline Sync Reports)
         │
[ Event Manager ]     ──► (Event Creation, Attendance Rosters, Media Publishing)
         │
[ Pastor ]            ──► (Sermon Studio, Pastoral Notes, Counseling Logs)
         │
[ Administrator ]     ──► (User Role Management, Financial Audits, System Settings)
```

---

## 2. STRIDE Threat Analysis Matrix

| STRIDE Category | Potential Threat Scenario | Target Asset | Likelihood | Impact | Implemented Mitigation / Control |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Spoofing** | Credential stuffing or brute forcing member/admin passwords | `/api/auth/login` | Medium | High | • IP & Token Bucket Rate Limiting (5 attempts / 15 min)<br>• Dummy Bcrypt hash on missing emails to prevent timing enumeration<br>• Account lockout telemetry |
| **Spoofing** | Session token forgery or tampering | `kcm_session` Cookie | Low | Critical | • HMAC-SHA256 signature verified via WebCrypto at Edge<br>• Session record verified in PostgreSQL<br>• `HttpOnly`, `Secure`, `SameSite=Lax` cookie flags |
| **Tampering** | Donation amount manipulation during Razorpay checkout | `/api/donations/session/verify` | Medium | Critical | • Order amount cryptographically signed on server<br>• Razorpay webhook signature verification via `crypto.timingSafeEqual`<br>• Exact paise-level database validation |
| **Tampering** | Uploading malicious executable disguised as JPG/PNG | `/api/upload/*` | Medium | High | • Binary magic-byte signature inspection (`validateFileSecurity`)<br>• Strict forbidden extension blocklist (`.exe`, `.svg`, `.html`, `.php`)<br>• Direct buffer streaming to Cloudinary CDN (isolated storage) |
| **Repudiation** | Administrator or Pastor altering records without trace | Core Database Records | Low | Medium | • Append-only `AuditLog` in PostgreSQL and `audit_events` in MongoDB<br>• Immutable timestamping and user ID binding on all modifications |
| **Information Disclosure** | Leakage of third-party API keys in client JavaScript bundles | Client JS Bundles | Medium | Critical | • Purged `NEXT_PUBLIC_` prefixes on sensitive keys<br>• Server routes use `process.env.FIRECRAWL_API_KEY` exclusively<br>• CI secret scanning via Trivy & Trufflehog rules |
| **Information Disclosure** | Internal stack trace or database error leaking in API response | `/api/*` Routes | Medium | Medium | • Global sanitized API response handlers (`lib/apiResponse.ts`)<br>• Generic error messages returned to clients; details logged server-side only |
| **Denial of Service** | Volumetric API spam or unauthenticated resource exhaustion | Edge & Next API Routes | Medium | High | • Edge rate limiters on public POST endpoints<br>• Nginx `client_max_body_size 50M;`<br>• 1500ms abort signals on external service calls (`safeTriggerCompanionEvent`) |
| **Elevation of Privilege** | Member attempting to access `/admin/*` or `/api/admin/*` | Administrative Endpoints | High | Critical | • Edge middleware checks `effectiveRole === 'ADMIN' \|\| 'SUPER_ADMIN'`<br>• Server route handlers re-verify DB session role before executing mutations<br>• Zero trust in client-supplied role claims |
