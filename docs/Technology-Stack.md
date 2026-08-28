# Technology Stack Specification

## Purpose
This document provides an exhaustive inventory of programming languages, runtime environments, frameworks, libraries, database engines, cloud services, and DevOps infrastructure tooling utilized in the Kingdom of Christ Ministries platform.

## Scope
Covers frontend, backend, database, messaging, infrastructure, security, monitoring, and developer toolchains.

## Status
> Status: Implemented

---

## 1. Core Languages & Runtimes

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Language** | TypeScript | `v5.4+ / v6.0` | Primary typed language for frontend application, API handlers, and infrastructure scripts |
| **Language** | JavaScript (Node.js) | `Node 20 LTS (Alpine)` | Backend companion runtime, worker loops, and microservices |
| **Markup & Styling** | HTML5 / CSS3 | Modern standard | Semantic web structure and responsive design |
| **IaC Language** | HCL (HashiCorp Config) | OpenTofu `v1.6+` | Declarative infrastructure as code provisioning |

---

## 2. Frontend Application Layer

| Component | Technology | Version | Description / Implementation Details |
| :--- | :--- | :--- | :--- |
| **Web Framework** | Next.js | `14.2.0` | React Server Components (RSC), App Router, dynamic server routes, and API handlers |
| **UI Library** | React | `18.3.0` | Component-based interactive UI library |
| **Styling Engine** | Tailwind CSS | `3.4.0` | Utility-first CSS framework with `tailwindcss-animate` |
| **UI Primitives** | Radix UI | Latest (`@radix-ui/*`) | Unstyled, accessible UI components (Dialogs, Dropdowns, Tabs, Toasts, Selects) |
| **Icons** | Lucide React | `0.363.0` | Consistent, lightweight SVG icon package |
| **Animations** | Framer Motion | `11.0.0` | Physics-based animations, layout transitions, and interactive micro-interactions |
| **Data Fetching** | SWR / React Query | `swr ^2.4.2`, `@tanstack/react-query ^5.101` | Client-side cache synchronization, optimistic updates, and background revalidation |
| **Forms & Validation** | Zod | `3.25.76` | Schema declaration and data validation library |
| **Maps & Geo** | MapLibre GL | `5.24.0` | Open-source vector tile maps for branch locations and event venues |
| **Theme Management** | next-themes | `0.4.6` | Seamless Light/Dark/System theme switching without layout flashes |

---

## 3. Backend & Real-time Companion Layer

| Component | Technology | Version | Description / Implementation Details |
| :--- | :--- | :--- | :--- |
| **HTTP Server** | Express.js | `5.2.1` | Lightweight API framework for companion tasks, cron webhooks, and heavy jobs |
| **Real-Time Engine** | Socket.io | `4.8.3` | Bidirectional event-based WebSocket communication |
| **Socket Scaling** | Redis Adapter | `@socket.io/redis-adapter ^8.3.0` | Multi-pod Socket.io broadcast adapter backed by Redis |
| **Job Queue** | BullMQ | `5.79.2` | Redis-backed distributed task queue and retry engine |
| **Metrics Collector** | prom-client | `15.1.0` | Prometheus metric instrumentation exposing `/metrics` endpoint |
| **AI SDK** | Google Generative AI | `@google/generative-ai ^0.24.1` | Gemini 1.5 Pro / Flash integration for ministry assistants |
| **AI SDK** | OpenAI / LangChain | `openai ^4.29.0`, `langchain ^0.1.30` | Embeddings generation, LLM chains, and RAG pipelines |

---

## 4. Databases & Persistence Layer

| Engine | Deployment Model | Version | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | CloudNativePG Operator (K8s) | `PostgreSQL 16` | Authoritative relational data (Members, Events, Sermons, Donations, Receipts) |
| **ORM** | Prisma ORM | `5.11.0` | Type-safe database client and automated migration engine |
| **Connection Pooler** | PgBouncer | `1.21+` | Transaction-level connection pooling for PostgreSQL |
| **MongoDB Atlas** | Managed Cloud Cluster | `MongoDB 7.0+` | Audit logs, system telemetry, notification logs, and AI conversation histories |
| **Redis** | Redis Sentinel / Cluster (K8s) | `Redis 7.2` | Fast caching, rate limit storage, Socket.io Pub/Sub, BullMQ queues |
| **Vector DB** | Pinecone | `2.1.0` | High-dimensional vector index for semantic sermon search |
| **Firebase** | Google Cloud Managed | `v12.8.0` | Client Google Sign-In verification, Firebase Cloud Messaging (FCM) |

---

## 5. Media & External Services

| Service | Provider | Implementation Purpose |
| :--- | :--- | :--- |
| **Media Storage & CDN** | Cloudinary | Auto-optimized image/video storage, transformations, and global CDN delivery |
| **Payments (INR)** | Razorpay | UPI, NetBanking, Debit/Credit Card offerings and tithes in Indian Rupees |
| **Payments (USD/Global)** | Stripe | International card donations and global ministry support |
| **Transactional Email** | Resend / SMTP | PDF donation receipts, event registration confirmations, account recovery emails |
| **SMS Delivery** | httpSMS Gateway | High-reliability Android GSM gateway for member notification broadcasts |
| **WhatsApp Messaging** | Twilio API | Automated prayer notifications and ministry broadcast channels |
| **Web Crawling & Research** | Firecrawl | Structured content extraction and web research for sermon preparation |

---

## 6. DevOps, Cloud Native & Platform Layer

| Category | Technology | Version | Purpose in Architecture |
| :--- | :--- | :--- | :--- |
| **Container Engine** | Docker | `24.0+` | Multi-stage container builds and containerization |
| **Orchestration** | Kubernetes | `1.28 - 1.30` | Container orchestration and workload scheduling |
| **Package Manager** | Helm | `v3.14+` | Kubernetes package management and umbrella charts |
| **IaC Engine** | OpenTofu | `v1.6+` | Open-source declarative infrastructure provisioning |
| **API Gateway** | Envoy Gateway | `v1.0+` | Kubernetes Gateway API implementation and edge traffic controller |
| **Service Mesh** | Istio | `v1.20+` | Zero-trust service-to-service mTLS and traffic shaping |
| **GitOps Controller** | Argo CD | `v2.10+` | Declarative GitOps continuous delivery and sync engine |
| **Progressive Delivery** | Argo Rollouts | `v1.6+` | Automated Canary releases and automated metric analysis |
| **Persistent Storage** | Longhorn | `v1.6+` | Distributed block storage with snapshotting and remote replication |
| **Backup Operator** | Velero | `v1.13+` | Kubernetes cluster disaster recovery and PVC backup operator |
| **Monitoring** | Prometheus | `v2.50+` | Time-series metrics collection and alert evaluation |
| **Dashboards** | Grafana | `v10.3+` | Operational dashboard visualization and alerting UI |
| **Logging Engine** | Grafana Loki | `v2.9+` | Scalable multi-tenant log aggregation engine |
| **Runtime Security** | Falco | `v0.37+` | Kernel-level syscall monitoring and runtime security engine |
| **Vulnerability Scanner** | Trivy Operator | `v0.18+` | Image vulnerability, config audit, and SBOM scanning |
| **Messaging Engine** | Apache Kafka | `v3.6+ (Strimzi)` | High-throughput asynchronous event streaming |
| **Messaging Engine** | NATS JetStream | `v2.10+` | Ultra-fast lightweight pub/sub and distributed key-value store |

---

## Security Considerations
All dependencies are locked in `package-lock.json` and scanned continuously for CVEs using Trivy and GitHub Dependabot.

## Related Documentation
- [Project-Structure.md](Project-Structure.md) — Directory layout of the codebase.
- [Requirements.md](Requirements.md) — System requirements and SLAs.
