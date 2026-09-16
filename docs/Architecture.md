# Kingdom of Christ Ministries (KCM) — Architecture Specification

> **Platform Version**: 1.0.0 Enterprise  
> **Topology**: Polyglot Monorepo (Next.js 14 App Router + Companion Node.js/Express Realtime Worker)  
> **Last Verified**: 2026-09-16  

---

## 1. System Overview

The Kingdom of Christ Ministries platform is an enterprise-grade church management, media streaming, community engagement, and digital giving system.

```
                                  ┌────────────────────────┐
                                  │      Client (Browser)  │
                                  │   (PWA / Desktop / iOS)│
                                  └───────────┬────────────┘
                                              │
                                              ▼
                             ┌──────────────────────────────────┐
                             │       Next.js 14 App Router      │
                             │  (Edge Middleware + Server Action│
                             │  + SSR + Client Component Shell) │
                             └────────┬─────────────────┬───────┘
                                      │                 │
             ┌────────────────────────┘                 └─────────────────────────┐
             ▼                                                                    ▼
┌─────────────────────────┐                                          ┌─────────────────────────┐
│     PostgreSQL (Neon)   │                                          │  Companion Worker/Socket│
│  Primary Relational DB  │                                          │  (Express 5 + Socket.io │
│   (Users, Offerings,    │                                          │  + BullMQ + Redis +     │
│   Events, Sermons)      │                                          │   Background AI Agents) │
└────────────┬────────────┘                                          └────────────┬────────────┘
             │                                                                    │
             ▼                                                                    ▼
┌─────────────────────────┐                                          ┌─────────────────────────┐
│    Cloudflare / CDN     │                                          │  External Services Gate │
│  & Cloudinary Media     │                                          │  (Firebase, Razorpay,   │
│   (Video, Audio, Img)   │                                          │   Stripe, Resend, httpSMS)│
└─────────────────────────┘                                          └─────────────────────────┘
```

---

## 2. Core Architecture Tenets

1. **Defense-in-Depth Authorization**:
   - Edge level cryptographic HMAC cookie validation (`middleware.ts`).
   - Route handler level explicit role checks (`requireAdminOrDev`, `requireEventManagerOrDev`, `requireStaffOrDev`).
2. **Zero-Crash Resilience**:
   - Granular React Error Boundaries at root (`app/error.tsx`, `app/global-error.tsx`).
   - Centralized `apiClient.ts` with exponential backoff, jitter, request cancellation, and idempotency protection.
3. **Polyglot Persistence**:
   - **Neon PostgreSQL**: Primary transactional system of record (users, sessions, payments, receipts, events, sermons).
   - **MongoDB Atlas**: Secondary append-only log store for system audit logs, device telemetry, and unstructured analytics.
4. **Realtime Decoupling**:
   - Socket.IO connection client handles companion availability gracefully without blocking browser rendering or causing white screens.
5. **No Secret Exposure**:
   - Diagnostic endpoints redact credentials with `[REDACTED_*]`.
   - Client bundle strictly separates `NEXT_PUBLIC_` from private server secrets.
