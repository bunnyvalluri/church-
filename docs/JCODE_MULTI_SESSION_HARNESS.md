# jcode Multi-Session Engineering Harness Architecture
## Kingdom of Christ Ministries (KCM) Church Platform

> **Engine Status**: `ACTIVE`  
> **Repository**: [https://github.com/1jehuang/jcode](https://github.com/1jehuang/jcode)  
> **Session Manager**: `scripts/jcode/session-manager.js`  

---

## 1. Overview & Architectural Philosophy

`jcode` is a Rust-based high-performance coding agent harness engineered specifically for multi-session and multi-agent parallel development. Unlike legacy agent implementations that spawn duplicate memory-heavy runtime instances, `jcode` operates on a **Single-Server, Multi-Client Architecture**:

- **Ultra-low RAM Footprint**: ~10–27 MB per session (~117 MB total across all 7 parallel engineering sessions).
- **Instantaneous Boot Time**: ~14ms session startup latency.
- **Shared Semantic Memory Graph**: Vector-embedded cascade retrieval that persists cross-session decisions, API schemas, and architectural constraints.
- **Domain-Specific File Locking**: Prevents file write collisions across concurrent sessions while allowing high throughput parallel edits.

---

## 2. The 7 Specialized Parallel Engineering Sessions

```
+-----------------------------------------------------------------------------------+
|                            jcode Swarm Orchestrator                               |
+-----------------------------------------------------------------------------------+
  |           |           |           |           |           |           |
  v           v           v           v           v           v           v
[Session 1] [Session 2] [Session 3] [Session 4] [Session 5] [Session 6] [Session 7]
 Event       Sermon      Security    Performance API Gateway PWA         Deployment
 Manager     Manager     Engine      Engine      Session     Session     DevOps
```

### Session 1: Event Manager Session (`1-event-manager.toml`)
- **Core Domain**: Event CRUD workflows, poster/banner upload pipelines, real-time push and web notifications.
- **Tech Stack**: Next.js App Router, Express API, Cloudinary/S3, Socket.io, Firebase FCM, BullMQ (`eventUploadQueue`).
- **Focus Paths**: `frontend/app/events`, `backend/src/services/eventService.js`, `backend/src/queues/eventQueue.js`.

### Session 2: Sermon Session (`2-sermon.toml`)
- **Core Domain**: Audio/video sermon uploads, Cloudinary media processing, automatic transcription, landing page hero banner sync.
- **Tech Stack**: Cloudinary API, Express, Next.js components, HLS video player.
- **Focus Paths**: `frontend/app/sermons`, `backend/src/services/sermonService.js`, `backend/src/queues/sermonAutomationQueue.js`.

### Session 3: Security Session (`3-security.toml`)
- **Core Domain**: Anti-forgery JWT token rotation, RBAC permission matrices, Zod API validation, magic-byte file inspection, security audit loops.
- **Tech Stack**: JWT, Express Middleware, Zod validation, Security Audit Loop.
- **Focus Paths**: `backend/src/middleware/auth.js`, `backend/src/middleware/rbac.js`, `docs/security/`.

### Session 4: Performance Session (`4-performance.toml`)
- **Core Domain**: Dynamic scroll virtualization, React Server Component (RSC) rendering, Next.js bundle chunking & tree-shaking.
- **Tech Stack**: React 18, Next.js, Framer Motion, TanStack Virtual, Lighthouse telemetry.
- **Focus Paths**: `frontend/app/`, `frontend/components/`, `frontend/next.config.js`.

### Session 5: API Gateway Session (`5-api-gateway.toml`)
- **Core Domain**: Unified Express/Next route refactoring, central rate-limiting middleware, correlation ID request logging.
- **Tech Stack**: Express, Next.js Edge Middleware, Pino/Winston logger, Rate-limiter.
- **Focus Paths**: `backend/server.js`, `frontend/middleware.ts`, `docs/gateway/`.

### Session 6: PWA Session (`6-pwa.toml`)
- **Core Domain**: Service worker caching strategies (Stale-While-Revalidate, Cache-First), IndexedDB offline storage, Background Sync API.
- **Tech Stack**: Service Worker API, IndexedDB, Workbox, Background Sync API.
- **Focus Paths**: `frontend/public/sw.js`, `frontend/lib/pwa/`.

### Session 7: Deployment Session (`7-deployment.toml`)
- **Core Domain**: GitHub Actions CI/CD pipelines, Docker/Kubernetes/ArgoCD manifests, Prometheus monitoring metrics, automated zero-downtime rollbacks.
- **Tech Stack**: GitHub Actions, Docker, K8s, Helm, ArgoCD, Prometheus, Grafana.
- **Focus Paths**: `.github/workflows/`, `k8s/`, `docker/`, `monitoring/`, `docs/Rollback.md`.

---

## 3. Swarm Inter-Session Communication Channels

The `swarm.json` specification defines structured pub/sub channels between sessions to broadcast events and prevent state divergence:

| Channel Name | Producer Sessions | Consumer Sessions | Event Payload Description |
| :--- | :--- | :--- | :--- |
| `events-channel` | Event Manager | PWA, Deployment, API Gateway | New event created, schema update, cache invalidation |
| `sermons-channel` | Sermon Manager | PWA, Performance | Media uploaded, HLS URL generated, hero banner update |
| `security-channel` | Security | API Gateway, Event, Sermon | Token rotation, authorization rule update, security audit alert |
| `performance-channel` | Performance | PWA, Event, Sermon | Bundle chunk alert, virtualization threshold update |
| `gateway-channel` | API Gateway | Security, Event, Sermon | Route refactored, rate limit rule change |
| `pwa-channel` | PWA | Performance, Event | Offline sync completed, Service Worker cache bumped |
| `deployment-channel` | Deployment | API Gateway, Security | Deployment status, automated rollback triggered |

---

## 4. Operation Runbook

### Initializing the Swarm (PowerShell)
```powershell
.\scripts\jcode\start-swarm.ps1
```

### Inspecting Swarm & Session Telemetry (Node.js)
```bash
node scripts/jcode/session-manager.js status
```

### Exporting Swarm Configuration
```bash
node scripts/jcode/session-manager.js swarm-config
```
