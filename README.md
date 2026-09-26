<div align="center">

<a href="https://kcmchurch.vercel.app">
  <img src="docs/assets/hero-banner.png" alt="Kingdom of Christ Ministries Banner" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</a>

# 🏛️ Kingdom of Christ Ministries
### Enterprise Digital Platform & Ministry Operating System

[![Live Production](https://img.shields.io/badge/Production-Live-success?style=flat-square&logo=vercel&logoColor=white)](https://kcmchurch.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-5.12_ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4_Modern_UI-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Verified_Giving-0C2340?style=flat-square&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline_Sync-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![i18n](https://img.shields.io/badge/i18n-EN_%7C_TE_%7C_HI-10B981?style=flat-square)](docs/frontend/I18N.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<br/>

**An enterprise-grade, high-availability digital ecosystem engineered for Kingdom of Christ Ministries (Hyderabad, India).**  
Powering real-time church operations, online stewardship, offline-first congregation engagement, trilingual localization, and multi-campus ministry management.

[**Explore Live Application ↗**](https://kcmchurch.vercel.app) • [**Architecture Specs**](docs/architecture/ARCHITECTURE.md) • [**API Inventory**](docs/api/API-INVENTORY.md) • [**Disaster Recovery Runbooks**](docs/reliability/runbooks/)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Core Platform Capabilities](#-core-platform-capabilities)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Technology Matrix](#-technology-matrix)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Quality Assurance & Verification](#-quality-assurance--verification)
- [Platform Security & Reliability](#-platform-security--reliability)
- [Containerization & Deployment](#-containerization--deployment)
- [Ministry Campuses & Contact](#-ministry-campuses--contact)
- [License](#-license)

---

## 🌟 Overview

The **Kingdom of Christ Ministries Platform** is an all-in-one digital operating system built to connect congregations, streamline worship broadcasts, automate tax-exempt financial stewardship, and coordinate community outreach programs.

### Key Highlights
- **Lightning-Fast Performance**: Built on Next.js 14 App Router with React Server Components, streaming SSR, and Edge Middleware optimization.
- **Pure White Modern Design**: Accessible, high-contrast, mobile-first design system with zero layout shifts and instant touch feedback.
- **Resilient Offline Architecture**: Progressive Web App (PWA) with persistent IndexedDB queue for offline prayers, notes, and event check-ins.
- **Trilingual Parity**: 100% dictionary synchronization across English (`en`), Telugu (`te`), and Hindi (`hi`).

---

## ⚡ Core Platform Capabilities

| Module | Description | Key Technologies |
| :--- | :--- | :--- |
| 🌐 **Trilingual Localization** | Complete dictionary synchronization across English, Telugu, and Hindi (2,200+ verified translation keys). Automated CI checks prevent missing-key fallbacks. | Next.js i18n, Static Parity Audits |
| 💳 **Verified Financial Pipeline** | Server-side Razorpay order generation with HMAC-SHA256 signature verification, idempotent webhook processing, and instant 80G tax receipt PDF generation. | Razorpay SDK, Web Crypto HMAC, PDFKit |
| 📱 **Offline-First PWA** | Offline submissions (prayer requests, event registrations) are securely buffered in IndexedDB (`kcm-offline-db`) and automatically replayed upon network recovery. | Service Workers, IndexedDB, Workbox |
| 🎥 **Media & Broadcast Hub** | Real-time live streaming integration, sermon archive indexing, categorization, and adaptive video streaming. | Cloudinary CDN, YouTube API |
| 🧠 **Theological AI Engine** | Context-aware biblical knowledge retrieval engine with input sanitization, rate-limiting, and theological guardrails. | Next.js Edge AI, DOMPurify |
| 🩺 **Automated Health Engine** | Continuous 40+ point automated health checks across database pools, external APIs, queue depth, and responsiveness with self-healing triggers. | Health Engine, BullMQ, Redis |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients[" 📱 Client Tier "]
        PWA["PWA Mobile & Desktop Web"]
        OfflineStore[("Local IndexedDB Queue")]
        PWA <--> OfflineStore
    end

    subgraph Perimeter[" 🛡️ Edge Security & Routing "]
        EdgeMiddleware["Next.js Edge Middleware<br/>• Session Integrity Verification<br/>• Rate Limiting & Origin Defense"]
    end

    subgraph Compute[" ⚡ Core Application Layer "]
        NextCore["Next.js 14 Server Engine<br/>• React Server Components (RSC)<br/>• 189 API Route Handlers<br/>• Trilingual Localization Pipeline"]
        AuxService["Node.js Auxiliary Workers<br/>• BullMQ Job Schedulers<br/>• Real-time WebSocket Dispatches"]
    end

    subgraph Data[" 🗄️ Persistence & Caching "]
        Postgres[("Neon PostgreSQL<br/>(42 Relational Models + PITR)")]
        RedisStore[("Upstash Redis<br/>(Distributed Cache & Rate Limits)")]
    end

    subgraph Integrations[" 🌐 Cloud & Payment Services "]
        RazorpayGateway["Razorpay Ingress<br/>(UPI Intent, Webhook HMAC)"]
        CloudinaryCDN["Cloudinary Media CDN<br/>(WebP/AVIF & 80G PDF Generation)"]
        AIEngine["AI Theological Engine"]
    end

    Clients -->|HTTPS Requests| Perimeter
    Perimeter --> NextCore
    NextCore -->|Prisma Connection Pool| Postgres
    NextCore -->|Redis Client| RedisStore
    NextCore --> RazorpayGateway
    NextCore --> CloudinaryCDN
    NextCore --> AIEngine
    AuxService --> NextCore
```

---

## 📂 Repository Structure

```
K.C.M-Portal/
├── frontend/                 # Next.js 14 App Router Monorepo Package
│   ├── app/                  # Application routes, server components & API handlers
│   ├── components/           # Modern UI components, modals, and design tokens
│   ├── hooks/                # Custom React hooks (useAuth, useSync, useI18n, useOnlineStatus)
│   ├── lib/                  # Shared core libraries (Prisma, Razorpay, Email, AI Engine)
│   ├── prisma/               # PostgreSQL relational schema (42 models) & seeds
│   └── tests/                # Automated Playwright E2E and visual tests
├── backend/                  # Node.js Auxiliary Services & Workers
│   ├── src/                  # Background BullMQ queues & cron workers
│   └── server.js             # Real-time WebSocket dispatcher
├── health/                   # Centralized Health & Diagnostics Engine
│   ├── core/                 # Health check registry and orchestrator
│   ├── database/             # 13 relational database integrity checks
│   ├── backend/              # 12 API endpoint and webhook verification checks
│   └── frontend/             # 15 responsive, accessibility and PWA checks
├── docs/                     # Technical Documentation & Operational Guides
│   ├── architecture/         # System diagrams & Architecture Decision Records (ADRs)
│   ├── api/                  # API inventory and endpoint contracts
│   ├── database/             # Schema documentation & PITR guidelines
│   └── reliability/          # High-availability runbooks and failure recovery guides
├── docker/                   # Multi-stage production-hardened Dockerfiles
├── k8s/                      # Kubernetes manifests (Deployments, Services, PDB, NetworkPolicies)
└── package.json              # Monorepo workspaces and root scripts
```

---

## 🛠️ Technology Matrix

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | `14.2.x` | React Server Components, Streaming SSR, Edge Middleware |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.4.x` | Monorepo-wide strict type contracts & compile-time safety |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `3.4.x` | Clean, accessible, mobile-first design system |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | `v16` | Serverless relational database with autoscaling & branching |
| **ORM** | [Prisma](https://www.prisma.io/) | `5.12.x` | Type-safe query building, migrations & relational modeling |
| **Caching & Queue** | [Upstash Redis](https://upstash.com/) & [BullMQ](https://bullmq.io/) | `Latest` | Sliding window rate limits, job scheduling & distributed locks |
| **Payment Gateway** | [Razorpay](https://razorpay.com/) | `Latest` | UPI Intent, Cards, Netbanking & verified 80G tax receipting |
| **Media & CDN** | [Cloudinary](https://cloudinary.com/) | `Latest` | Image optimization, AVIF/WebP transformations, PDF rendering |
| **Testing** | [Playwright](https://playwright.dev/) & [Jest](https://jestjs.io/) | `Latest` | Cross-browser automated end-to-end and unit testing |
| **Containerization** | [Docker](https://www.docker.com/) & [Kubernetes](https://kubernetes.io/) | `node:22-alpine` | Hardened non-root containers & declarative cloud orchestration |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: PostgreSQL 15+ instance or a free [Neon](https://neon.tech) database

### 1. Clone & Install
```bash
git clone https://github.com/bunnyvalluri/church-.git
cd church-
npm install
```

### 2. Environment Configuration
Copy the template configuration files into your local environment:
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Configure the essential connection parameters in `frontend/.env.local`:
```env
# Database Connection (Neon / PostgreSQL)
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>?sslmode=require"

# Cryptographic Session Secret
SESSION_SECRET="<generate-a-secure-64-character-hex-string>"

# Public Keys & Client Config
NEXT_PUBLIC_GOOGLE_CLIENT_ID="<your-google-client-id>"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_<your-key-id>"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<your-cloud-name>"

# Private Backend Integration Secrets
RAZORPAY_KEY_SECRET="<your-razorpay-key-secret>"
RAZORPAY_WEBHOOK_SECRET="<your-webhook-secret>"
```

### 3. Database Initialization
```bash
# Generate Prisma Client bindings
npm run postinstall

# Synchronize schema definitions with database
npm run db:push

# (Optional) Seed sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Quality Assurance & Verification

The project includes an extensive suite of automated checks, static analysis tools, and health monitors:

```bash
# 1. Typecheck the entire monorepo
npm run typecheck

# 2. Verify 100% trilingual translation sync (EN, TE, HI)
npm run i18n:check -w frontend

# 3. Execute End-to-End browser test suite
npm run test:e2e

# 4. Run Centralized Health & Self-Healing Audit
npm run agent:audit

# 5. Compile production build
npm run build
```

---

## 🛡️ Platform Security & Reliability

- **Perimeter Edge Verification**: Cryptographic session tokens verified at the Edge Middleware layer via Web Crypto HMAC-SHA256 using secure, `HttpOnly`, `SameSite=Lax` cookies.
- **CSRF & Origin Enforcement**: State-mutating API routes validate incoming origin and referer headers against trusted domain allowlists.
- **Continuous PITR Backups**: Neon PostgreSQL maintains continuous 7-day WAL archiving with Recovery Point Objective (RPO) < 15 minutes.
- **Operational Runbooks**: 11 detailed production runbooks located in [`docs/reliability/runbooks/`](docs/reliability/runbooks/) covering disaster recovery, cache resets, and database failovers.

---

## 🐳 Containerization & Deployment

Production container images are constructed using multi-stage `node:22-alpine` Dockerfiles with unprivileged non-root execution contexts (`UID 1001`):

```bash
# Build and run production containers locally
npm run docker:prod

# Stop production containers
npm run docker:prod:down

# Apply Kubernetes cluster manifests
npm run k8s:apply
```

---

## 📍 Ministry Campuses & Contact

**Kingdom of Christ Ministries (KCM Church)**  
- 🌐 **Official Portal**: [https://kcmchurch.vercel.app](https://kcmchurch.vercel.app)  
- 📧 **General Inquiries**: [kingofchristministries23@gmail.com](mailto:kingofchristministries23@gmail.com)  
- 📱 **Phone Contact**: +91 96409 43777  
- 📍 **Main Campus**: 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad – 500055, Telangana, India  
- 📍 **Affiliated Campuses**: Shapur Nagar • Subhash Nagar • Bahadurpally  

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Copyright © 2026 Kingdom of Christ Ministries. All rights reserved.
