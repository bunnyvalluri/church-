# KCM Portal — Comprehensive Security Architecture Specification

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  
**Auditing Team:** Principal Security & DevSecOps Engineering Team  

---

## 1. Architectural Topology & Trust Boundaries

The Kingdom of Christ Ministries (KCM Church) web application implements a multi-tier, zero-trust serverless and companion architecture.

```text
                                  [ INTERNET ]
                                        │
                         (TLS 1.3 / HSTS Preload / WAF)
                                        │
                                        ▼
                   ┌────────────────────────────────────────┐
                   │          Vercel Edge Network           │
                   │   • Global Anycast Routing             │
                   │   • DDoS Mitigation & Rate Limiting     │
                   │   • Edge Middleware & CSRF Defense     │
                   └────────────────────┬───────────────────┘
                                        │
                     ┌──────────────────┴──────────────────┐
                     ▼                                     ▼
        ┌─────────────────────────┐           ┌─────────────────────────┐
        │   Edge Middleware       │           │   React Server Comps    │
        │   (WebCrypto HMAC-SHA)  │           │   (Zero-Bundle Security)│
        └────────────┬────────────┘           └────────────┬────────────┘
                     │                                     │
                     └──────────────────┬──────────────────┘
                                        ▼
                   ┌────────────────────────────────────────┐
                   │    Next.js 14 App Router API Layer     │
                   │    • Strict Server-Side Zod Validation │
                   │    • Dynamic Session Resolution (DB)   │
                   │    • Audit Logging Engine              │
                   └────────────────────┬───────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌──────────────┐                ┌──────────────┐                ┌──────────────┐
│ Neon Server- │                │ Upstash      │                │ Cloudinary   │
│ less Postgres│                │ Redis Cloud  │                │ Media CDN    │
│ (Prisma ORM  │                │ (TLS Cache & │                │ (Signed URLs │
│ Pooled TLS)  │                │ Token Bucket)│                │ & Magic Byte)│
└──────────────┘                └──────────────┘                └──────────────┘
```

---

## 2. Technology Stack & Security Profile

| Layer | Technology | Security Implementation & Safeguards |
| :--- | :--- | :--- |
| **Edge & CDN** | Vercel Edge Network | Automatic SSL/TLS 1.3 termination, HSTS preload, DDoS protection. |
| **Frontend UI** | Next.js 14, React 18, Tailwind | Zero XSS via React JSX escaping, sanitized JSON-LD, CSP-restricted inline styles. |
| **Edge Middleware** | Next.js Edge Runtime (`crypto.subtle`) | Cryptographic HMAC-SHA256 session token verification at 0ms latency, CSRF defense, HTTPS redirect. |
| **API Layer** | Next.js Route Handlers | Strict Zod schema validation, constant-time credential comparison, input sanitization via `sanitize-html`. |
| **Primary Database** | Neon Serverless PostgreSQL | TLS `sslmode=require`, Prisma ORM parameterized queries (zero raw SQL concatenation), connection pooling. |
| **Telemetry & Logs** | MongoDB Atlas | Append-only audit logs, IP masking, isolated telemetry collections. |
| **Cache & Rate Limit** | Upstash Redis Cloud | TLS `rediss://`, token bucket rate limiters for auth/payments/SMS. |
| **Authentication** | Custom HMAC Session + NextAuth | `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`kcm_session`), sliding expiration, session revocation table. |
| **Authorization** | 6-Tier Role-Based Access Control | Server-side role resolution: `SUPER_ADMIN`, `ADMIN`, `PASTOR`, `EVENT_MANAGER`, `FIELD_VOLUNTEER`, `MEMBER`. |
| **File Storage** | Cloudinary Media API | Binary magic-byte validation, forbidden extension filtering, file size limits (5MB images, 50MB video). |
| **Realtime Engine** | Socket.IO v4 & Redis Adapter | Environment-isolated WebSockets, safe mock socket fallback in production, non-blocking companion dispatch. |
| **Reverse Proxy** | Nginx (`nginx/nginx.conf`) | `server_tokens off;`, `client_max_body_size 50M;`, strict security headers. |
| **Orchestration** | Kubernetes (`k8s/`), Docker | Non-root containers, read-only root filesystems where applicable, template secret masks. |
