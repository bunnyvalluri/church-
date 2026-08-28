# System Architecture Specification

## Purpose
This document provides a comprehensive technical architecture overview of the **Kingdom of Christ Ministries (KCM Church)** production web platform and infrastructure. It describes the component relationships, runtime topology, data flow, security boundaries, and design patterns implemented across the repository.

## Scope
Covers the entire monorepo architecture:
- Next.js 14 Frontend (App Router, React 18, Tailwind CSS, Radix UI)
- Express & Socket.io Companion Backend (REST APIs, Real-time WebSockets, Background Workers, BullMQ)
- Database Tier (Authoritative PostgreSQL with CloudNativePG/Prisma, MongoDB Atlas for telemetry, Firebase Auth/FCM)
- Media Storage & CDN (Cloudinary SDK, transformations, responsive optimization)
- Kubernetes Platform (Envoy Gateway, Istio, Argo CD, Argo Rollouts, Longhorn, Velero, Falco, Trivy, Prometheus, Grafana, Loki)
- Event Streaming (Apache Kafka, NATS JetStream, Redis Pub/Sub)

## Status
> Status: Implemented

---

## 1. High-Level System Architecture

The KCM platform employs a modern, decoupled microservices-and-platform architecture designed for high availability, low latency, real-time engagement, and resilient edge delivery.

```mermaid
graph TD
    Client[Web Browser / Mobile PWA / Native Client] -->|HTTPS / WSS (Port 443)| Gateway[Envoy Gateway / HTTPRoutes]
    
    subgraph Frontend Tier
        Gateway -->|HTTP Route: /*| NextApp[Next.js 14 Frontend Application]
        NextApp -->|App Router Server Components| RSC[Server Side Rendering / React Server Components]
        NextApp -->|Route Handlers| FrontendAPI[Next.js API Route Handlers]
    end

    subgraph Companion Backend Tier
        Gateway -->|HTTP Route: /api/socket, /api/ai/*| ExpressServer[Express.js & Socket.io Server]
        ExpressServer -->|BullMQ Tasks| BackgroundWorkers[Worker Loops & Processors]
    end

    subgraph Data & Persistence Tier
        FrontendAPI -->|Prisma ORM (Port 5432)| PGCluster[(CloudNativePG PostgreSQL Cluster)]
        FrontendAPI -->|MongoDB Driver (Port 27017)| MongoAtlas[(MongoDB Atlas - Logs & Events)]
        FrontendAPI -->|Firebase Admin SDK| FirebaseService[(Firebase Auth & Firestore Offline)]
        FrontendAPI -->|Cloudinary Node SDK| CloudinaryCDN[(Cloudinary Media CDN)]
        
        ExpressServer -->|Prisma ORM| PGCluster
        ExpressServer -->|Native Driver| MongoAtlas
        ExpressServer -->|Redis Client (Port 6379)| RedisCache[(Redis In-Memory Cache & Pub/Sub)]
    end

    subgraph Asynchronous Event Streaming
        ExpressServer -->|Kafka Producer| KafkaBroker[(Apache Kafka Cluster)]
        ExpressServer -->|NATS JetStream Publisher| NATSCluster[(NATS JetStream Messaging)]
        BackgroundWorkers -->|Kafka / NATS Consumer| WorkerProcessors[Event Processing Workers]
    end

    subgraph Observability & Runtime Security
        PrometheusCollector[Prometheus Scraper] -->|Metrics Port: 9090| PGCluster
        PrometheusCollector -->|Metrics Port: 9121| RedisCache
        PrometheusCollector -->|Metrics Port: 9092| ExpressServer
        LokiCollector[Grafana Loki] -->|Log Ingestion: 3100| PodLogs[Cluster Log Streams]
        FalcoDaemon[Falco DaemonSet] -->|Syscall Alerts| Alertmanager[Prometheus Alertmanager]
        TrivyScanner[Trivy Operator] -->|CRD Reports| KubernetesAPI[Kubernetes Control Plane]
    end
```

---

## 2. Frontend Tier Architecture

The frontend is built on **Next.js 14 (App Router)** leveraging React 18 server and client components:

- **Rendering Paradigm**: Hybrid Server-Side Rendering (SSR), Static Site Generation (SSG) for public sermon/event directories, and dynamic Client-Side Rendering (CSR) for real-time dashboards (Pastor Portal, Member Portal, Admin Console).
- **Styling & UI Components**: Tailwind CSS combined with `@radix-ui` headless primitives, `lucide-react` icons, and `framer-motion` for fluid animations.
- **State Management & Data Fetching**: SWR and `@tanstack/react-query` for optimistic updates, caching, and background revalidation.
- **Form Management & Validation**: Zod schema validation for strict client and server-side request verification.
- **Offline & PWA Layer**: Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.json`), and IndexedDB synchronization queue (`lib/offline/`) ensuring reliable operation in low-connectivity environments.

---

## 3. Companion Backend Architecture

The companion backend runs as an **Express.js (Node.js)** server designed for long-lived WebSocket connections, CPU-heavy tasks, and cron-driven background loops:

- **Real-Time Communication**: `socket.io` with `@socket.io/redis-adapter` for horizontal scaling across Kubernetes replicas.
- **AI & Automation Engine**: Integrates Google Generative AI (`@google/generative-ai`), LangChain, OpenAI, and OpenRouter for sermon assistant services, prayer request categorization, and Bible study insights.
- **Task Queues & Workers**: BullMQ powered by Redis for reliable background job execution, automated upload verification, and retry policies.
- **External Communications**: HTTP SMS gateway engine (`httpsms`), Resend / Nodemailer for transactional emails, and Twilio WhatsApp integration.

---

## 4. Database Architecture & Data Ownership

To guarantee strict transactional integrity while supporting high-throughput logging, data ownership is clearly partitioned:

| Data Store | Role | Scope of Ownership | Replication / Scaling |
| :--- | :--- | :--- | :--- |
| **PostgreSQL (CloudNativePG)** | Authoritative Relational Master | Users, Roles, Events, Registrations, Sermons, Donations, Receipts, Prayer Requests, Branches, Attendance. | 3-node HA cluster with synchronous streaming replication, automated failover, and PgBouncer. |
| **MongoDB Atlas** | Document & Event Telemetry | System event logs, audit logs, notification logs, AI chat conversation histories, activity feeds. | Multi-AZ replica set with TTL expiration indexes. |
| **Firebase Auth & Firestore** | Identity & Offline Fallback | Google OAuth token exchange, phone auth, push notification device tokens (FCM), client offline cache. | Google Cloud Managed global identity infrastructure. |
| **Redis** | In-Memory Cache & Message Broker | Session caching, API rate limiting counters, Socket.io Pub/Sub adapter, BullMQ task queues. | Master-Replica with persistent volumes. |

---

## 5. Media & Asset Pipeline

Media assets (event posters, sermon video recordings, profile pictures, NGO gallery imagery) follow a structured Cloudinary pipeline:

1. **Client / Admin Upload**: Files are validated on the client (MIME type, file size bounds) and submitted as multipart/form-data to Next.js API upload handlers (`app/api/upload/*`).
2. **Buffer Streaming**: The server streams the buffer directly to Cloudinary using `cloudinary.uploader.upload_stream`.
3. **Automated Transformation**: Images receive automatic WebP/AVIF format conversion (`f_auto`), adaptive quality compression (`q_auto`), and responsive bounding (`w_2000, c_limit`). Videos receive automated streaming profiles.
4. **Metadata Persistence**: Returned secure URLs, public IDs, dimensions, and asset formats are persisted in PostgreSQL via Prisma.
5. **Background Verification**: Dedicated verification loops (`backend/src/loops/uploadVerificationLoop.js`) confirm CDN asset accessibility and heal broken references.

---

## 6. Kubernetes Infrastructure & Gateway Architecture

The production environment operates on Kubernetes managed via declarative GitOps:

- **Ingress / Gateway**: Kubernetes Gateway API implemented via **Envoy Gateway** with HTTPRoutes handling path-based routing, TLS termination via cert-manager, JWT security policies, and rate-limiting filters.
- **Service Mesh**: Optional **Istio** integration for mutual TLS (mTLS), strict service-to-service authorization policies, and distributed telemetry injection.
- **GitOps Engine**: **Argo CD** synchronizes cluster state directly from Git repository manifests, supporting automated rollouts.
- **Progressive Delivery**: **Argo Rollouts** executes automated Canary releases with Prometheus-based metric analysis and automatic rollback upon error spikes.
- **Persistent Storage**: **Longhorn** distributed block storage provides high-performance, replicated PersistentVolumes (`longhorn-cloudnativepg`, `longhorn-fast`, `longhorn-redis`, `longhorn-loki`).
- **Disaster Recovery**: **Velero** executes scheduled cluster-wide backups of Kubernetes CRDs, secrets, and volume snapshots to remote object storage.

---

## 7. Observability & Security Architecture

The platform embeds defense-in-depth security and unified observability:

- **Runtime Threat Detection**: **Falco** monitors kernel syscalls in real-time, detecting unauthorized shell executions, privilege escalations, and sensitive file reads.
- **Vulnerability Scanning**: **Trivy Operator** continuously audits container images, Kubernetes workloads, and infrastructure-as-code manifests, generating CycloneDX/SPDX Software Bills of Materials (SBOM).
- **Metrics & Dashboards**: **Prometheus** scrapes application endpoints, PgBouncer, Redis, Kafka, and NATS exporters. **Grafana** serves tailored operational dashboards.
- **Centralized Logging**: **Grafana Loki** ingests structured JSON logs collected by Fluentbit/Promtail agents, queryable via LogQL.

---

## Configuration & Environment Mapping
The architecture is configured via standardized environment variable injection. Refer to [Environment-Variables.md](Environment-Variables.md) for full configuration mapping.

## Security Considerations
- Zero-trust network policies (`NetworkPolicy`) restrict pod-to-pod traffic in Kubernetes.
- Secrets are securely injected as Kubernetes Secrets and never committed to Git.
- User authentication credentials use bcrypt cryptographic hashing with salted rounds.

## Related Documentation
- [Architecture-Diagrams.md](Architecture-Diagrams.md) — Comprehensive visual workflow diagrams.
- [Technology-Stack.md](Technology-Stack.md) — Detailed library and tool versions.
- [Database-Architecture.md](Database-Architecture.md) — Database design and schema topology.
