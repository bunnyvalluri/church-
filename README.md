<div align="center">

# 🏛️ Kingdom of Christ Ministries
### Enterprise Digital Platform & Ministry Operating System

[![Production Status](https://img.shields.io/badge/Production-Live-22C55E?style=for-the-badge&logo=vercel&logoColor=white)](https://kcmchurch.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript 5.4](https://img.shields.io/badge/TypeScript-5.4_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.12_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4_Modern_UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Verified_Giving-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline_Sync-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![i18n](https://img.shields.io/badge/i18n-EN_%7C_TE_%7C_HI-10B981?style=for-the-badge)](docs/frontend/I18N.md)
[![License](https://img.shields.io/badge/License-MIT-gray.svg?style=for-the-badge)](LICENSE)

<br/>

**A high-performance, resilient digital ecosystem engineered for Kingdom of Christ Ministries (Hyderabad, India).**  
Built with Next.js 14 App Router, TypeScript, Neon Serverless PostgreSQL, Upstash Redis, Razorpay Online Giving, Offline-First PWA Synchronization, and an AI Theological Context Engine.

[**🌐 Live Application**](https://kcmchurch.vercel.app) • [**📐 System Architecture**](docs/architecture/ARCHITECTURE.md) • [**⚡ API Directory**](docs/api/API-INVENTORY.md) • [**📖 Operational Runbooks**](docs/reliability/runbooks/)

</div>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [Key Architectural Pillars](#-key-architectural-pillars)
- [System Architecture](#-system-architecture)
- [Core Platform Capabilities](#-core-platform-capabilities)
- [Monorepo Workspace Layout](#-monorepo-workspace-layout)
- [Technology Matrix](#-technology-matrix)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Quality Assurance & Verification](#-quality-assurance--verification)
- [Security, Backup & Disaster Recovery](#-security-backup--disaster-recovery)
- [Containerization & Deployment](#-containerization--deployment)
- [Ministry Locations & Contact](#-ministry-locations--contact)
- [License](#-license)

---

## 📌 Executive Summary

The **Kingdom of Christ Ministries Platform** powers the congregation's digital services, live broadcast coordination, community prayer requests, philanthropic outreach, event registrations, and financial stewardship across multiple campus locations.

- **Unified Cross-Platform Experience**: Responsive design tailored for mobile web, desktop, and progressive web application (PWA) clients.
- **Relational Data Integrity**: 42 relational models maintained in PostgreSQL with transaction isolation and continuous point-in-time recovery (PITR).
- **Edge Security Verification**: Session authentication and perimeter defense handled at the Next.js Edge Middleware layer.
- **Trilingual Accessibility**: Complete UI localization across English, Telugu, and Hindi without missing-key fallback anomalies.

---

## 🏛️ Key Architectural Pillars

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js 14 App Router (RSC)                        │
├────────────────────┬────────────────────┬───────────────────────────────┤
│   Zero-Trust Edge  │ Offline-First PWA  │    Verified Financial Flow    │
│  Middleware Auth   │  & Replay Engine   │    & 80G Tax-Deductible Ingress │
└────────────────────┴────────────────────┴───────────────────────────────┘
```

1. **Edge-First Verification**: Session integrity, rate-limiting, and security headers are processed at the network perimeter before reaching origin compute.
2. **Offline-Resilient Mutations**: Critical interactions (such as prayer requests and registrations) queue locally in IndexedDB and synchronize automatically upon network reconnection.
3. **Cryptographic Payment Pipelines**: Server-verified order creation with HMAC-SHA256 signature verification and idempotent webhook reconciliation.
4. **Comprehensive Telemetry**: Health checks across all subsystems with automated recovery runbooks.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client["📱 PWA & Web Clients (Desktop / Mobile)"]
    Edge["🛡️ Edge Middleware Layer<br/>(Session Verification & Rate Limiting)"]
    App["⚡ Next.js 14 Core Engine<br/>(React Server Components & API Subsystems)"]
    DB[("🗄️ Neon PostgreSQL<br/>(Primary System of Record - 42 Models)")]
    Cache[("⚡ Upstash Redis & BullMQ<br/>(Rate Limiting, Cache & Job Queues)")]
    Ext["🌐 Cloud Services<br/>(Razorpay • Cloudinary CDN • AI Engine)"]

    Client -->|HTTPS / PWA| Edge
    Edge --> App
    App -->|Prisma ORM (Connection Pool)| DB
    App -->|Redis Client| Cache
    App -->|Signed HTTPS Calls| Ext
```

---

## ✨ Core Platform Capabilities

### 1. Trilingual Localization Engine (EN | TE | HI)
- Dictionary-synchronized translation pipeline across **English (`en`)**, **Telugu (`te`)**, and **Hindi (`hindi`)** with over 2,200 verified keys per locale.
- Client and server locale detection with zero layout shift during locale switches.
- Automated static key verification via `npm run i18n:check -w frontend`.

### 2. Secure Financial Stewardship & 80G Receipts
- **Server-Verified Checkout**: Razorpay payment orders generated strictly within backend server actions to eliminate client-side price tampering.
- **HMAC-SHA256 Signature Validation**: Ingress payment webhooks process raw payload buffers and deduplicate events using deterministic SHA-256 event hashing.
- **Instant Tax Receipt Generation**: Compliant 80G tax-exempt digital certificates featuring verifiable cryptographic validation codes and dynamic PDF streaming.

### 3. Offline-First Progressive Web Application
- **IndexedDB Mutation Store**: Offline submissions (prayer networks, event participation) buffer securely inside IndexedDB with client-generated UUIDs.
- **Replay & Reconciliation**: Background service workers detect network resumption and safely drain queues with server idempotency.

### 4. Ministry Media & Knowledge Engine
- Dynamic video catalog and live-stream integration with optimized adaptive streaming metadata.
- Context-aware biblical knowledge engine with strict rate-limiting, sanitization, and theological boundaries.

### 5. Automated Health Engine & Observability
- Centralized health check registry covering database connectivity, query response times, queue latency, and CDN availability.
- Automated monitoring tools and failure recovery scripts located in `scripts/deployment/`.

---

## 📂 Monorepo Workspace Layout

```
K.C.M-Portal/
├── frontend/               # Next.js 14 App Router Web Application
│   ├── app/                # Route handlers, server components & API routes
│   ├── components/         # Modern UI design system components
│   ├── hooks/              # Custom hooks (useAuth, useSync, useOnlineStatus, useI18n)
│   ├── lib/                # Shared utilities, payment handlers & database clients
│   ├── prisma/             # PostgreSQL database schema & migration files
│   └── tests/              # Playwright E2E and visual regression test suites
├── backend/                # Node.js Auxiliary Services & Queues
│   ├── src/                # Background job workers, schedulers & BullMQ queues
│   └── server.js           # Real-time WebSocket and background dispatchers
├── health/                 # Multi-tier Health & Audit Engine
│   ├── core/               # Health registry and engine orchestrator
│   ├── database/           # Connection pooling & integrity audits
│   ├── backend/            # API endpoints & webhook verification checks
│   └── frontend/           # Responsiveness, accessibility & PWA audits
├── docs/                   # Architectural blueprints, schemas & operational runbooks
│   ├── architecture/       # System diagrams & Architecture Decision Records (ADRs)
│   ├── api/                # API contracts and route inventory
│   ├── database/           # Schema documentation & PITR guidelines
│   └── reliability/        # Incident runbooks and recovery plans
├── docker/                 # Production-hardened container configurations
├── k8s/                    # Kubernetes manifests & deployment configurations
└── package.json            # Root workspace scripts and dependencies
```

---

## 🛠️ Technology Matrix

| Layer | Technology | Purpose & Capabilities |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) App Router | React Server Components, Streaming SSR, Edge Middleware |
| **Programming Language** | [TypeScript 5.4](https://www.typescriptlang.org/) | Strict end-to-end type safety and contract enforcement |
| **Styling & Design** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Consistent mobile-first styling and design tokens |
| **Primary Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless PostgreSQL with connection pooling & branching |
| **ORM & Migrations** | [Prisma 5.12](https://www.prisma.io/) | Schema definitions, type generation, and automated migrations |
| **Caching & Job Queue** | [Upstash Redis](https://upstash.com/) & [BullMQ](https://bullmq.io/) | Distributed rate-limiting, session store & background queues |
| **Payment Gateway** | [Razorpay](https://razorpay.com/) | UPI Intent, Netbanking, Cards, automated 80G receipt generation |
| **Asset Delivery** | [Cloudinary](https://cloudinary.com/) | Cloud media optimization with WebP/AVIF transformations |
| **Testing Framework** | [Playwright](https://playwright.dev/) & [Jest](https://jestjs.io/) | Cross-browser automated end-to-end and unit testing |
| **Container & Orchestration** | [Docker](https://www.docker.com/) & [Kubernetes](https://kubernetes.io/) | Multi-stage non-root containers, PDBs, and NetworkPolicies |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: PostgreSQL 15+ instance or a cloud database (such as [Neon](https://neon.tech))

### 1. Clone the Repository
```bash
git clone https://github.com/bunnyvalluri/church-.git
cd church-
npm install
```

### 2. Configure Environment Variables
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Ensure essential values are defined in `frontend/.env.local`:
```env
# Database Connection
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>?sslmode=require"

# Session Security
SESSION_SECRET="<generate-secure-64-character-hex-string>"

# Public Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID="<your-google-client-id>"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_<your-key-id>"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<your-cloud-name>"

# Private Integrations
RAZORPAY_KEY_SECRET="<your-razorpay-key-secret>"
RAZORPAY_WEBHOOK_SECRET="<your-webhook-secret>"
```

### 3. Initialize Database Schema
```bash
# Generate Prisma Client bindings
npm run postinstall

# Push schema definitions to database
npm run db:push

# (Optional) Seed initial records
npm run db:seed
```

### 4. Launch Development Environment
```bash
npm run dev
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Quality Assurance & Verification

Execute the test suites and validation tools across the monorepo:

```bash
# 1. Monorepo TypeScript static analysis
npm run typecheck

# 2. Multilingual translation key parity verification
npm run i18n:check -w frontend

# 3. End-to-End browser test suite
npm run test:e2e

# 4. Comprehensive health and integrity audit
npm run agent:audit

# 5. Production build compilation
npm run build
```

---

## 🛡️ Security, Backup & Disaster Recovery

- **Perimeter Defense**: Cryptographic session tokens verified at the Edge Middleware layer using Web Crypto HMAC-SHA256 in secure, `HttpOnly`, `SameSite=Lax` cookies.
- **Origin & CSRF Defense**: State-mutating endpoints enforce strict origin and referer header verification against trusted domain allowlists.
- **Continuous Backups (PITR)**: Neon PostgreSQL maintains continuous Write-Ahead Log (WAL) archiving with Recovery Point Objective (RPO) < 15 minutes.
- **Standardized Runbooks**: Operational guides located in [`docs/reliability/runbooks/`](docs/reliability/runbooks/) covering disaster recovery, cache resets, and failovers.

---

## 🐳 Containerization & Deployment

Production container builds utilize multi-stage Alpine Linux images running under an unprivileged user context:

```bash
# Build and run production containers locally
npm run docker:prod

# Terminate production containers
npm run docker:prod:down

# Apply Kubernetes cluster manifests
npm run k8s:apply
```

---

## 📍 Ministry Locations & Contact

**Kingdom of Christ Ministries (KCM Church)**  
- 🌐 **Official Portal**: [https://kcmchurch.vercel.app](https://kcmchurch.vercel.app)  
- 📧 **Direct Inquiries**: [kingofchristministries23@gmail.com](mailto:kingofchristministries23@gmail.com)  
- 📱 **Phone Contact**: +91 96409 43777  
- 📍 **Main Campus**: 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad – 500055, Telangana, India  
- 📍 **Affiliated Campuses**: Shapur Nagar • Subhash Nagar • Bahadurpally  

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Copyright © 2026 Kingdom of Christ Ministries. All rights reserved.
