# KCM Church Platform — System Architecture & Topology

> Cross-Reference: See full architectural specification at [Architecture.md](file:///c:/K.C.M-Portal/docs/Architecture.md) and diagram catalog at [Architecture-Diagrams.md](file:///c:/K.C.M-Portal/docs/Architecture-Diagrams.md).

---

## 1. High-Level Runtime Topology

```mermaid
graph TD
    User([End Users / Mobile PWA / Admin]) -->|HTTPS (TLS 1.3)| VercelEdge[Vercel Global Edge Network]
    
    subgraph Frontend Layer: Vercel Serverless
        VercelEdge --> NextServer[Next.js 14 App Router]
        NextServer --> SSR[React Server Components]
        NextServer --> ClientHydration[Interactive React Client & Service Worker]
        NextServer --> API[Next.js Serverless Route Handlers]
    end

    subgraph Data & Storage Layer
        API -->|Prisma ORM (Pooled TLS)| NeonPG[(Neon Serverless PostgreSQL)]
        API -->|Redis TLS| UpstashRedis[(Upstash Redis Cache & Pub/Sub)]
        API -->|HTTPS| Cloudinary[(Cloudinary Media Delivery)]
        API -->|Admin SDK| Firebase[(Firebase Authentication & FCM Push)]
    end

    subgraph Companion Backend Layer (Optional Realtime Daemon)
        API -.->|safeTriggerCompanionEvent (HTTP 1.5s Timeout)| ExpressCompanion[Express Companion Server]
        ExpressCompanion --> SocketIO[Socket.IO Gateway]
        SocketIO -.->|WSS| ClientHydration
    end
```

---

## 2. Key Architectural Tenets (Post-Audit Hardening)

1. **Graceful Serverless Decoupling:**
   - The frontend application is 100% self-sufficient on Vercel serverless functions.
   - All external companion notifications (`safeTriggerCompanionEvent`) are non-blocking with 1500ms abort signals.
   - Client WebSocket connections cleanly fall back to mock sockets when no external companion URL is configured, eliminating mixed-content and connection refusal errors.

2. **Security & Header Isolation:**
   - `next.config.js` acts as the single source of truth for RFC 8941 Structured Headers, CSP, HSTS, and Permissions-Policy.
   - Global duplicate headers removed from `vercel.json` to prevent edge proxy header duplication.

3. **Data Integrity & Schema Mapping:**
   - Authoritative relational data resides in PostgreSQL on Neon with schema mappings (`@@map("pastors")`) enforced across all environments.
   - 16 models with 190 live records verified.

4. **Offline-First & Mobile Resilience:**
   - PWA Service Worker (`v5`) enforces Cache-First for immutable assets and Stale-While-Revalidate for dynamic code chunks.
   - WCAG 2.2 AA keyboard navigation (including modal `Escape` key dismissal) and 0-horizontal-overflow across 21 responsive breakpoints (320px to 3840px).
