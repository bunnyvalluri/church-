# KCM Portal — Master Architecture & Software Design Specification

## 1. Executive Summary & Design Paradigm

The Kingdom of Christ Ministries (KCM) Church Platform is designed with a layered, decoupled, and highly modular architecture that emphasizes:
- **Clean Separation of Concerns**: Clear demarcation between Presentation (UI/React), Application Services, Domain/Business Logic, Data Access, and Infrastructure.
- **High Cohesion & Low Coupling**: Independent domain modules (Auth, Events, Sermons, Prayers, Giving, NGO, Realtime, Media) communicating through standardized service contracts and Zod-validated data boundaries.
- **Resilient & Offline-First UX**: Progressive Web App (PWA) with IndexedDB client buffering and deterministic server reconciliation.
- **Enterprise-Grade Security**: Anti-brute-force rate limiting, HMAC SHA256 session signatures, timing-safe webhook verification, and AI safety pipelines.

```
+-----------------------------------------------------------------------------------+
|                           LOGICAL TIER ARCHITECTURE                               |
+-----------------------------------------------------------------------------------+
|  [ 1. Presentation Tier ]                                                         |
|     - Next.js 14 App Router, Client/Server Components, Framer Motion             |
|     - Centralized Design System (Tailwind CSS, Lucide icons, Next-Themes)         |
|     - Custom React Hooks (`useEvents`, `useAuth`, `useOfflineDraft`, etc.)        |
|                                                                                   |
|  [ 2. Application Service Tier ]                                                  |
|     - API Gateway Layer (`apiResponse.ts`, `apiClient.ts`, standard DTOs)         |
|     - Email Delivery Engine (`CompositeEmailProvider`, Resend, SMTP)              |
|     - Payment Engine (`PaymentService`, Razorpay Webhook Verifier, Receipt Engine)|
|     - AI Intelligence (`aiSecurityPipeline`, sanitization, tool allowlists)       |
|                                                                                   |
|  [ 3. Domain & Business Logic Tier ]                                              |
|     - OODA Loop Registry (`LOOP.md`, Event Loop, Branch Monitoring Loop)          |
|     - Multilingual Engine (`i18n`, English / Telugu / Hindi translation parity)   |
|     - State Registry (`STATE.md`, dynamic queue & branch compliance tracking)     |
|                                                                                   |
|  [ 4. Persistence & Infrastructure Tier ]                                         |
|     - PostgreSQL / Neon (Direct Connection Pooling, Prisma ORM, Neon WAL PITR)   |
|     - MongoDB Atlas (Unstructured Audit Logs, Activity History)                   |
|     - Redis Cluster (BullMQ asynchronous job queues, WebSocket pub/sub)           |
|     - Cloudinary Storage (Server-signed media uploads, WebP transformations)      |
+-----------------------------------------------------------------------------------+
```

---

## 2. Architectural Design Patterns & Principles

1. **Facade Pattern**:
   - Centralized client interfaces such as `apiClient.ts`, `EmailService`, and `paymentService.ts` provide a unified entry point while concealing underlying protocol and network details.
2. **Strategy Pattern (Composite Transports)**:
   - `CompositeEmailProvider` chooses dynamically between Resend, SMTP, and Mock transports based on configuration and runtime availability.
3. **Repository Pattern (Prisma / Mongoose)**:
   - Data access logic is isolated behind model methods and typed Prisma queries, avoiding ad-hoc raw SQL across UI components.
4. **Idempotency Guard Pattern**:
   - Deterministic SHA256 hashing across `(recipient + template + scope)` and `(paymentId + orderId)` prevents duplicate state mutations.
