# Kingdom of Christ Ministries (KCM Church) — Production Backend Architecture Specification

**Document Version**: 3.0.0-ENTERPRISE  
**Architectural Pattern**: Modular Domain-Driven Architecture (Hexagonal / Clean Architecture)  
**Classification**: Enterprise Core System Documentation  
**Runtime**: Node.js LTS (v20+ / v22+) • Express 5 • Strict TypeScript  

---

## 1. Architectural Overview & System Design

The Kingdom of Christ Ministries (KCM Church) backend provides high-performance, fault-tolerant, and zero-trust services across 148 church application routes. It balances real-time spiritual engagement (Socket.IO live prayer, sermon broadcasting) with enterprise financial operations (Razorpay donations, tithes), field evangelism, and PWA offline sync.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                         │
│   Next.js 14 Web PWA  •  iOS / Android Safari / Chrome  •  Field Volunteer Tablets    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / WSS
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EDGE & GATEWAY SECURITY                                   │
│   • Origin CORS Whitelist Validation        • Correlation ID Injection (X-Request-Id)  │
│   • Tiered Rate Limiting (General/Auth/Hook)• Cloudflare / Vercel Edge Protection      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             EXPRESS APPLICATION LAYER                                  │
│   • Request Context & Structured Logger    • Cryptographic Session Extraction          │
│   • Zero-Trust Role-Based Access Control   • Branch-Scoped Access Guards               │
│   • Raw Body Capture for HMAC Verification • Centralized Error Sanitizer               │
└───────┬───────────────────────────────────┬────────────────────────────────────┬───────┘
        │                                   │                                    │
        ▼                                   ▼                                    ▼
┌─────────────────┐               ┌──────────────────┐                 ┌─────────────────┐
│ REST API ROUTER │               │ REAL-TIME ENGINE │                 │ WEBHOOK INGEST  │
│ 20 Domain       │               │ Socket.IO Server │                 │ Razorpay HMAC   │
│ Modules         │               │ Redis Adapter    │                 │ httpSMS Inbound │
└───────┬─────────┘               └────────┬─────────┘                 └────────┬────────┘
        │                                  │                                    │
        ▼                                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION & DOMAIN SERVICES                                 │
│   • Auth & GIS Verification     • Attendance & Check-In    • Offline Concurrency Sync  │
│   • Donation Idempotency Engine • Sermon Media Streaming   • Prayer Pastoral Routing   │
│   • Notification Dispatcher     • Cloudinary Signed Media  • Financial Reconciliation  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE & INFRASTRUCTURE                             │
│   ┌───────────────────────────┐ ┌───────────────────────────┐ ┌────────────────────┐   │
│   │   Neon PostgreSQL (Prisma)│ │    MongoDB Atlas Client   │ │  Redis & BullMQ    │   │
│   │   Primary Source of Truth │ │    Audit & Log Streams    │ │  Async Queues & RT │   │
│   └───────────────────────────┘ └───────────────────────────┘ └────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Module Responsibilities

The backend is organized into strictly bounded directories under `backend/src/`:

```
backend/src/
├── bootstrap/
│   ├── app.ts                  # Express application setup, security middlewares, route mounting
│   ├── server.ts               # HTTP & Socket.IO server creation, port retry & binding
│   └── lifecycle.ts            # Graceful shutdown, signal handlers (SIGINT/SIGTERM), resource drain
├── config/
│   ├── env.ts                  # Validated, typed environment variables with defaults
│   ├── database.ts             # Connection pool settings, timeouts, and MongoDB configuration
│   ├── cors.ts                 # CORS whitelist and dynamic origin validator
│   ├── security.ts             # Rate-limiting thresholds, headers, and cookie options
│   ├── redis.ts                # Redis connection configuration with TLS / Upstash support
│   └── services.ts             # Third-party configurations (Razorpay, Cloudinary, Firebase, Resend)
├── shared/
│   ├── logger.ts               # Structured JSON logger with request IDs and sensitive field masking
│   ├── errors.ts               # Typed AppError hierarchy (UnauthorizedError, ForbiddenError, etc.)
│   ├── constants.ts            # HTTP status codes, UserRoles, Branch definitions, Queues
│   └── utils.ts                # Hashing, crypto tokens, phone formatting, pagination helpers
├── types/
│   ├── auth.types.ts           # UserRole, AuthUser, SessionTokenPayload, GoogleCredentialPayload
│   ├── common.types.ts         # ApiResponse envelope, PaginatedResult, QueryPaginationOptions
│   └── express.d.ts            # Express Request augmentation (user, id, correlationId)
├── domain/
│   ├── user.entity.ts          # Member domain invariants, permission rules
│   ├── donation.entity.ts      # Financial invariants, payment status, idempotency
│   ├── event.entity.ts         # Event scheduling, seat reservation rules
│   ├── sermon.entity.ts        # Sermon streaming links and engagement counters
│   ├── prayer.entity.ts        # Prayer request entity with pastoral assignment
│   └── offlineSync.entity.ts   # Offline mutation packet and optimistic concurrency checks
├── application/
│   ├── dtos/                   # Input contracts and DTOs
│   └── services/
│       ├── eventPublisher.ts   # Real-time WebSocket and Queue event publishing facade
│       └── auditService.ts     # Dual-write audit log recorder (PostgreSQL + MongoDB)
├── infrastructure/
│   ├── prisma/client.ts        # Singleton PrismaClient with connection pooling & diagnostics
│   ├── mongodb/mongoClient.ts  # Singleton MongoDB Atlas client with reconnect resilience
│   ├── redis/client.ts         # ioredis client with Upstash TLS support and fallback
│   ├── bullmq/queueManager.ts  # Queue initializer and job enqueueing facade
│   ├── cloudinary/client.ts    # Server-signed upload signature generator
│   ├── razorpay/client.ts      # Razorpay client & HMAC-SHA256 signature verifier
│   ├── firebase/admin.ts       # Firebase Admin SDK initialization
│   ├── firebase/fcm.ts         # Push notification dispatcher (multicast & single)
│   └── google/gis.ts           # Google Identity Services ID token verification
├── api/
│   ├── middlewares/
│   │   ├── requestLogger.middleware.ts  # Correlation ID (X-Request-Id) and latency logger
│   │   ├── auth.middleware.ts           # Dual-strategy auth (HttpOnly Cookie + Bearer token)
│   │   ├── rbac.middleware.ts           # Role-based & Branch-scoped authorization guards
│   │   ├── rateLimiter.middleware.ts    # Tiered rate limiters (general, auth, webhook, notification)
│   │   ├── validation.middleware.ts     # Request payload validation runner
│   │   └── errorHandler.middleware.ts   # Global error responder masking internal leaks
│   ├── responses/apiResponse.ts         # Standardized JSON response envelope helpers
│   └── routes/index.ts                  # Master router aggregating all 20 domain subrouters
├── modules/
│   ├── auth/                   # Google Identity Services verification, session tokens
│   ├── users/                  # User profile management and administrative role changes
│   ├── members/                # Church member directory and branch search
│   ├── branches/               # Hyderabad 3 Campuses (Kukatpally, Banjara Hills, Secunderabad)
│   ├── events/                 # Event scheduling, registration limits, seat reservation
│   ├── attendance/             # QR check-in and attendance records
│   ├── sermons/                # Sermon library, media streaming links, bookmarks
│   ├── prayers/                # Prayer requests, prayer wall, pastoral assignments
│   ├── donations/              # Razorpay checkout, tithes, offerings, idempotency
│   ├── finance/                # Financial aggregates, donation reconciliation
│   ├── notifications/          # Multi-channel push, SMS, email notification dispatch
│   ├── media/                  # Server-signed Cloudinary uploads, asset registration
│   ├── ngo/                    # NGO community feeding, education programs, outreach stats
│   ├── volunteers/             # Volunteer departments, roster scheduling, applications
│   ├── groups/                 # Small groups and home cell fellowships
│   ├── announcements/          # Church announcements and emergency bulletins
│   ├── offline-sync/           # Offline mutation queue with optimistic versioning
│   ├── reports/                # Operational and church analytics reporting
│   ├── audit-logs/             # Centralized security audit inspection
│   └── administration/         # Super-admin diagnostics and health checks
├── realtime/
│   ├── socketServer.ts         # Socket.IO gateway with CORS allowlist & Redis adapter
│   ├── socketAuth.ts           # Handshake token verification
│   └── roomManager.ts          # Granular room subscription (public, member, admin, branch)
├── jobs/
│   ├── mediaWorker.ts          # BullMQ background media processing
│   └── notificationWorker.ts   # BullMQ background notification dispatcher
└── webhooks/
    ├── razorpay.webhook.ts     # Razorpay HMAC-SHA256 signature verification & idempotent sync
    ├── httpsms.webhook.ts      # httpSMS delivery status webhook handler
    └── google.webhook.ts       # Google Apps Script event sync webhook handler
```

---

## 3. Database Architecture & Data Integrity

### 3.1 PostgreSQL (Neon) Primary Source of Truth
* Managed via **Prisma ORM** (`backend/prisma/schema.prisma`).
* Stores structured core relational entities: `User`, `Event`, `Donation`, `Sermon`, `PrayerRequest`, `EventAttendance`, `AuditLog`, `DeviceToken`, `Session`.
* **Idempotency**: All payment transactions enforce unique `idempotencyKey` / `orderId` indexing to prevent duplicate charges or double recording.
* **Concurrency**: Optimistic locking patterns ensure concurrent edits to records do not overwrite newer versions.

### 3.2 MongoDB Atlas Document Storage
* Utilized for high-throughput, unstructured event logging: `audit_events`, `system_events`, `notification_events`.
* Configured with reconnection resilience, socket timeouts, and automatic retry on network drops.

### 3.3 Redis & BullMQ
* Provides distributed caching, socket room pub/sub adapter (`@socket.io/redis-adapter`), and asynchronous job queues.
* Auto-detects Upstash TLS (`rediss://`) and gracefully operates in offline / bypass mode when Redis is unconfigured during local development.

---

## 4. Application Security Controls

1. **Authentication**:
   * Dual-strategy authentication supporting **HttpOnly SameSite Cookies** (`kcm_session`) for browser clients and **Bearer Tokens** for mobile PWA/API clients.
   * Cryptographic HMAC-SHA256 signed session tokens verified at the edge and application server.
   * Server-side **Google Identity Services (GIS)** verification using `google-auth-library` ensuring client identity claims are validated directly against Google certificates.
2. **Authorization**:
   * Granular Role-Based Access Control: `SUPER_ADMIN`, `ADMIN`, `PASTOR`, `EVENT_MANAGER`, `FIELD_VOLUNTEER`, `MEMBER`, `NGO_ADMIN`.
   * Branch scoping prevents volunteer or pastoral accounts from modifying events or viewing member records outside their assigned campus.
3. **Webhooks & Idempotency**:
   * Razorpay webhooks capture raw request buffers to verify `x-razorpay-signature` using HMAC-SHA256 before processing payloads.
   * Webhook deduplication ensures identical webhook deliveries are acknowledged safely without duplicate database operations.
4. **Data Protection & Masking**:
   * Structured JSON logger automatically redacts sensitive keys: `password`, `token`, `secret`, `authorization`, `cookie`, `razorpay_signature`.
   * Production error handler masks internal database connection strings, file paths, and stack traces, returning sanitized error codes.
5. **Rate Limiting**:
   * Tiered IP rate limiting prevents brute-force attacks against auth routes (15 attempts / 15m), general endpoints (300 req / 15m), and webhook endpoints.

---

## 5. Health Probes & Observability

| Endpoint | Method | Purpose | Response |
|---|---|---|---|
| `/health/live` | `GET` | Container liveness check | Memory usage, process uptime, live status |
| `/health/ready` | `GET` | Container readiness check | PostgreSQL database connection probe & latency |
| `/health` | `GET` | Diagnostic overview | Status of PostgreSQL, MongoDB, Redis, and workers |
| `/api/admin/diagnostics` | `GET` | Admin diagnostic status | Detailed cluster health (requires ADMIN auth) |

Health endpoints are fully anonymized and reveal **zero passwords, connection URIs, or internal member data**.

---

## 6. Verification & Automated Testing

The backend includes a zero-dependency automated test suite covering:
* ✅ **Health & Probes**: Liveness and readiness endpoints return standard payloads.
* ✅ **Security & RBAC**: Unauthenticated requests receive 401; unauthorized roles receive 403; admin receives 200.
* ✅ **Financial Integrity**: Negative and non-idempotent donation requests are rejected; valid orders return proper paise amounts.
* ✅ **Webhook Verification**: Unsigned or forged webhooks are rejected with 400 Bad Request.
* ✅ **Offline Synchronization**: Stale client versions are flagged as conflicts; valid mutations are applied.
* ✅ **Error Sanitization**: Non-existent routes return structured 404 envelopes without stack traces.
