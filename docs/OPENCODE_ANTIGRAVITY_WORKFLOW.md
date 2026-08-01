# OPENCODE-ANTIGRAVITY-AUTH AI WORKFLOW ENGINEERING SYSTEM
## KCM Ministries Church Platform — Development & Optimization Guide

> **Plugin**: `opencode-antigravity-auth`  
> **Status**: `OPERATIONAL & VERIFIED`  
> **Target Platform**: KCM Ministries Church Platform (Next.js, Node.js, Neon PostgreSQL, Cloudinary, Socket.io, Firebase FCM, PWA)

---

## 1. Executive Summary & Plugin Architecture

The `opencode-antigravity-auth` plugin is the core AI workflow engine designed to supercharge development velocity, enforce strict architectural discipline, and eliminate context degradation bottlenecks across the KCM Ministries Church Platform.

### Key Architecture Components:
- **Authentication & Gateway**: Persistent, secure session tokens (`antigravity-auth-gateway`) with 1-hour auto-rotation.
- **Model Rotation Engine**: Dynamic switching between **Claude** (for complex architecture, schema design, security policy definition, and system decomposition) and **Gemini** (for fast, high-volume implementation, large refactors, unit test generation, and worker code).
- **Session Memory Graph**: Shared graph database stored in `.jcode/memory/graph.db` providing cross-session synchronization and state recovery.

```
       ┌─────────────────────────────────────────────────────────┐
       │             opencode-antigravity-auth Plugin             │
       └────────────────────────────┬────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│     Claude 3.7 Sonnet   │                       │    Gemini 3.6 Flash     │
│   (Architecture Mode)   │                       │  (Implementation Mode)  │
├─────────────────────────┤                       ├─────────────────────────┤
│ • OpenAPI Specs         │─── Memory Snapshot ──►│ • High-Speed Coding     │
│ • Database ERDs         │   & Architecture Spec │ • Large File Refactoring│
│ • Security Policies     │                       │ • Async Workers & Swarm │
│ • System Boundaries     │                       │ • Unit & E2E Testing    │
└─────────────────────────┘                       └─────────────────────────┘
```

---

## 2. Model Rotation Strategy & Execution Protocol

### Rule of Handoff
1. **Architectural Phase (Claude)**:
   - Define exact interfaces, TypeScript types, API contracts, security constraints, and database migration scripts.
   - Output structured RFC markdown or spec JSON into `.jcode/memory/specs/`.
2. **Implementation Phase (Gemini)**:
   - Read architectural specs from `.jcode/memory/specs/`.
   - Rapidly synthesize full component code, API route handlers, state hooks, and background BullMQ workers.
   - Run automated lint and verification commands.
3. **Rotation Trigger**:
   - Automated handoff triggers when step token usage crosses 80,000 tokens or when transitioning from design to bulk execution.

---

## 3. The 10 AI Workflow Domains (Step-by-Step Execution Protocols)

### Domain 1: Multi-Session Coding
- **Objective**: Run concurrent development streams without context collisions.
- **Session Routing**:
  - `Session-1`: Auth & User Roles (`Admin`, `Pastor`, `Member`)
  - `Session-2`: Media Pipelines (`Sermons`, `Cloudinary`)
  - `Session-3`: Realtime & Push (`Socket.io`, `Firebase FCM`)
  - `Session-4`: Transactions (`Donations`, `Prayer Requests`)
  - `Session-5`: PWA & Gateway (`Service Worker`, `API Proxy`)
- **Plugin Command**: `npx opencode-antigravity-auth session:spawn --domain <domain_name>`

### Domain 2: Large Refactors
- **Objective**: Execute multi-file structural updates safely across Next.js App Router and Node backend services.
- **Protocol**:
  1. Claude generates AST refactoring blueprints.
  2. Gemini executes multi-file string replacements and line edits in parallel using optimistic file locking.
  3. Validate through `npm run lint` and `npm run test`.

### Domain 3: Parallel Agent Development (Swarm Mode)
- **Objective**: Deploy background subagents to work on isolated modules simultaneously.
- **Swarm Lock**: Managed via `.jcode/jcode.config.toml` optimistic locking (`lock_timeout_seconds = 300`).
- **Use Case**: Concurrent build of Admin Portal analytics and Member Portal prayer feeds.

### Domain 4: Performance Optimization
- **Objective**: Achieve Lighthouse Performance 95+ and dynamic bundle size < 250KB.
- **Actions**:
  - Image optimization via Cloudinary dynamic transformations (`f_auto,q_auto`).
  - Next.js dynamic code splitting (`next/dynamic`) for heavy components (e.g. video player, interactive maps).
  - PWA precaching strategy via Workbox.

### Domain 5: Security Hardening
- **Objective**: Zero vulnerability exposure across public and administrative endpoints.
- **Security Envelope**:
  - JWT RS256 signature validation with rate limiting (120 RPM per IP).
  - File upload magic-byte inspection (JPEG, PNG, WebP, PDF, MP4, MP3).
  - RBAC Middleware enforcing `ADMIN`, `PASTOR`, `MEMBER`, and `VOLUNTEER` permissions.

### Domain 6: API Gateway Implementation
- **Objective**: Unified routing layer managing proxy requests between Next.js frontend (`localhost:3000`) and Express backend (`localhost:4000`).
- **Key Files**: [docs/gateway/api-gateway-spec.md](file:///c:/K.C.M-Portal/docs/gateway/api-gateway-spec.md), Express router `/api/v1/gateway`.

### Domain 7: PWA Offline Sync
- **Objective**: Ensure seamless offline app capability for members and pastors in low-connectivity environments.
- **Features**:
  - IndexedDB storage for offline Prayer Requests, Sermon notes, and Event bookmarks.
  - Background Sync API to automatically flush queued actions when internet connectivity is restored.

### Domain 8: Cloudinary Integration
- **Objective**: Scalable church media hosting (Sermon video clips, Event banners, Ministry photos).
- **Features**: Direct signed client uploads, thumbnail generation, automatic webp/avif format conversion.

### Domain 9: Socket.io Realtime Flows
- **Objective**: Live interactive church experiences.
- **Realtime Rooms**:
  - `sermon_live`: Live chat and prayer counter during live streams.
  - `prayer_wall`: Instant updates when new prayer requests or intercessions occur.
  - `admin_notifications`: Real-time system health and donation alerts.

### Domain 10: Firebase FCM Notifications
- **Objective**: Targeted mobile and web push broadcasts.
- **Topic Routing**:
  - `kcm_topic_all`: Urgent church-wide announcements.
  - `kcm_topic_pastors`: Leadership alerts and member care requests.
  - `kcm_topic_events`: Dynamic updates for registered event attendees.

---

## 4. Operational Mapping Across All 8 KCM Modules

| Module Name | Core Features | Primary Model | Workflow Domains Applied |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | System overview, user management, audit logs, AI skill orchestrator | Claude (Design) + Gemini (Exec) | Multi-session, Security, API Gateway, Swarm |
| **Pastor Portal** | Pastoral care notes, member directory, sermon manager, prayer inbox | Claude (Design) + Gemini (Exec) | PWA Offline Sync, FCM Notifications, Cloudinary |
| **Member Portal** | Profile, saved sermons, event registrations, giving history | Gemini (Implementation) | PWA Sync, Socket.io, Cloudinary, FCM |
| **Event Manager** | Calendar, branch events (Shapur, Subhash, Bahadurpally), attendance | Gemini (Implementation) | Cloudinary, Socket.io, FCM Notifications |
| **Sermons** | Video/audio streaming, transcript search, notes, series playlists | Claude (Design) + Gemini (Exec) | Performance Opt, Cloudinary, PWA Offline |
| **Donations** | Tithes, offerings, payment gateway integration, receipts | Claude (Security Design) | Security Hardening, API Gateway, Realtime |
| **Prayer Requests**| Submit request, intercessor wall, confidentiality toggle, status update | Gemini (Implementation) | Socket.io Realtime, FCM Notifications, PWA |
| **Notifications** | Dynamic push center, email queue, topic manager, delivery logs | Gemini (Implementation) | Firebase FCM, Socket.io, Parallel Agents |

---

## 5. AI Bottleneck Elimination & Speed Optimization Strategies

1. **Eliminate Re-Research Bottlenecks**:
   - Always check `.jcode/memory/graph.db` and existing Knowledge Items before issuing exploratory queries.
2. **Context Window Protection**:
   - Pass concise architectural spec files instead of entire codebase histories when switching between Claude and Gemini.
3. **Async Script Verification**:
   - Use `scripts/ai-workflow-orchestrator.js` to instantly diagnose plugin status and routing readiness without manual environment inspection.
4. **Optimistic Parallel Edits**:
   - Group non-contiguous code edits using structured replacement tools to maximize throughput per turn.

---

## 6. Verification & Telemetry

Execute the verification command at any point during development:

```bash
node scripts/ai-workflow-orchestrator.js
```

Telemetry metrics are exposed at `http://127.0.0.1:9091` in Prometheus format to monitor active AI sessions, lock contention, and token usage velocity.
