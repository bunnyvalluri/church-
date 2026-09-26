# Security Policy — Kingdom of Christ Ministries (KCM) Platform

## Reporting a Vulnerability

The safety and privacy of our church members, pastoral staff, and donors are paramount. If you discover a potential security vulnerability in the KCM Church platform, please notify us responsibly.

### How to Report
- **Email**: security@kingdomofchristministries.org / vallurirahul888@gmail.com
- **Response Time**: We acknowledge received vulnerability reports within 24 hours.
- **Remediation Target**: Critical issues are triaged and remediated within 48-72 hours.

Please do not publicly disclose vulnerabilities before they have been resolved.

---

## Security Architecture & Core Defenses

1. **Authentication & Sessions**:
   - Cryptographic edge session validation using `HMAC-SHA256` Web Crypto.
   - `HttpOnly`, `Secure`, `SameSite=Lax` cookies for all session tokens.
   - Automatic session invalidation upon logout or role revocation.

2. **Role-Based Access Control (RBAC)**:
   - Server-enforced authorization across `/api/admin/*`, `/api/pastor/*`, `/api/event-manager/*`, and `/api/member/*`.
   - Never trusts client-supplied roles from localStorage or request bodies.

3. **Database Security**:
   - Parameterized queries enforced through Prisma ORM to prevent SQL injection.
   - SSL/TLS mandatory for all database connections (`sslmode=require`).
   - Strict field selection to ensure passwords, hashes, and internal keys are never returned to clients.

4. **Payment & Webhook Security**:
   - Razorpay & Stripe webhooks verified using HMAC-SHA256 cryptographic signatures.
   - Idempotency and replay attack prevention using SHA-256 event ID deduplication.

5. **Defense-in-Depth Headers**:
   - Strict Content Security Policy (CSP), HSTS (63072000s with preload), X-Content-Type-Options: nosniff, and frame-ancestors 'self'.
