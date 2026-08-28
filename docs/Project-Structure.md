# Project Monorepo Structure

## Purpose
This document provides an authoritative breakdown of the file and directory layout across the Kingdom of Christ Ministries (KCM Church) monorepo.

## Scope
Covers root workspaces, frontend application, backend companion services, database definitions, platform IaC/Kubernetes manifests, monitoring configs, and scripts.

## Status
> Status: Implemented

---

## 1. Top-Level Monorepo Layout

```
K.C.M-Portal/
├── .github/                 # GitHub Actions CI/CD workflows and automation pipelines
├── backend/                 # Companion Express.js server, Socket.io, BullMQ workers, AI engines
├── database/                # Prisma schema, migrations, CloudNativePG config, and seeds
├── docker/                  # Multi-stage Dockerfiles and docker-compose configurations
├── docs/                    # Complete Enterprise Documentation System
├── frontend/                # Next.js 14 Web Application (App Router, UI components, API routes)
├── k8s/                     # Standalone Kubernetes Kustomize manifests
├── monitoring/              # Grafana dashboards, Prometheus alerts, Loki configs, OpenTofu
├── platform/                # Cloud Native platform (Gateway, IaC, Storage, Kafka, NATS, Security)
├── reports/                 # Quality audit reports, test logs, and security assessments
├── scripts/                 # System management scripts, test harnesses, database seeders
├── package.json             # Monorepo root package configuration (npm workspaces)
└── README.md                # Repository README and quick start overview
```

---

## 2. Frontend Structure (`frontend/`)

```
frontend/
├── app/                     # Next.js 14 App Router
│   ├── (auth)/              # Login, register, forgot-password route groups
│   ├── admin/               # Admin Management Portal pages
│   ├── api/                 # Next.js Serverless API Route Handlers
│   │   ├── auth/            # Auth session, credentials, Google sync handlers
│   │   ├── donations/       # Razorpay / Stripe checkout, status, webhook handlers
│   │   ├── events/          # Event CRUD, registration, check-in, media uploads
│   │   ├── member/          # Member profiles, feedback, prayer submissions
│   │   ├── ngo/             # NGO campaigns, projects, volunteer management
│   │   ├── pastor/          # Pastoral sermon, group, and settings management
│   │   ├── sermons/         # Public sermon search, bookmarks, likes, streams
│   │   ├── sync/            # Offline PWA synchronization handler
│   │   └── upload/          # Cloudinary multipart buffer upload handlers
│   ├── events/              # Public Event calendar, detail pages, registration UI
│   ├── get-involved/        # Volunteer signups, small groups, serve forms
│   ├── give/                # Giving / Offering portal, dynamic UPI QR, receipt view
│   ├── member/              # Authenticated Member Portal (Dashboard, prayers, giving)
│   ├── ngo/                 # KCM NGO Community Outreach portal and project showcases
│   ├── pastor/              # Authenticated Pastor Portal & OpenClaw AI Orchestrator
│   ├── prayer/              # Public / Member Prayer submission interface
│   ├── sermons/             # Sermon streaming library, search filters, audio player
│   ├── layout.tsx           # Root Layout with ThemeProvider, Navbar, Footer, Providers
│   └── page.tsx             # Main Church Landing Page (Hero, quick actions, featured sermons)
├── components/              # Reusable React UI Components
│   ├── ui/                  # Headless Radix UI components styled with Tailwind CSS
│   ├── auth/                # Login, Register, Protected Route Guards
│   ├── events/              # Event cards, calendar views, registration forms
│   ├── member/              # Profile cards, donation tables, prayer request widgets
│   ├── pastor/              # Pastoral management tables, sermon editor modals
│   ├── openclaw/            # OpenClaw AI Orchestrator chat and execution view
│   └── pwa/                 # PWA offline banners, install prompts
├── hooks/                   # Custom React hooks (useAuth, useOffline, useSWR, useSocket)
├── lib/                     # Core utility libraries
│   ├── cloudinary.ts        # Cloudinary SDK client, folder mapping, transformations
│   ├── db.ts                # Prisma Client singleton instantiation
│   ├── firebase.ts          # Firebase Web Client configuration
│   ├── firebaseAdmin.ts     # Firebase Admin SDK token verification client
│   ├── mongodb/             # MongoDB Atlas client, repositories, and audit loggers
│   ├── offline/             # IndexedDB queue, conflict manager, offline cache engine
│   └── paymentService.ts    # Razorpay and Stripe API integration routines
├── public/                  # Static assets, logos, icons, sw.js, manifest.json
├── package.json             # Frontend package dependencies and scripts
└── tailwind.config.ts       # Tailwind CSS theme, colors, and animation tokens
```

---

## 3. Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── infrastructure/      # Database and caching client connections
│   │   └── mongodb/         # MongoDB native connection pool and index setup
│   ├── loops/               # Periodic background automation loops
│   │   ├── eventUploadLoop.js       # Event media synchronization loop
│   │   ├── sermonAutomationLoop.js  # Sermon AI transcription & indexing loop
│   │   └── uploadVerificationLoop.js# Cloudinary asset health verification loop
│   ├── middleware/          # Express middleware (Rate limiting, webhook verification)
│   ├── modules/             # Domain modules (Notifications, SMS, MongoDB repositories)
│   │   └── notifications/   # FCM, Email, and httpSMS dispatchers
│   ├── queues/              # BullMQ queue managers and retry systems
│   ├── routes/              # Express API route modules (AI routes, event routes)
│   ├── services/            # Core business logic services
│   │   ├── auditLogger.js   # Audit trail logger writing to MongoDB
│   │   ├── fcmService.js    # Firebase Cloud Messaging push notification engine
│   │   ├── llmProviderEngine.js # Multi-model LLM abstraction (Gemini, Claude, GPT)
│   │   └── smsService.js    # httpSMS delivery engine with automatic retry
│   ├── utils/               # Structured loggers, API response wrappers
│   └── workers/             # Dedicated worker entrypoints
├── server.js                # Express & Socket.io server entrypoint
└── package.json             # Backend package dependencies and scripts
```

---

## 4. Platform & Infrastructure Structure (`platform/`)

```
platform/
├── backup/                  # Velero backup schedules, storage targets, and runbooks
├── database/                # CloudNativePG PostgreSQL operator, clusters, PgBouncer, alerts
├── gateway/                 # Envoy Gateway API configs, HTTPRoutes, GatewayClasses, policies
├── helm/                    # Enterprise Helm charts (umbrella chart + subcharts)
│   └── charts/              # Subcharts for backend, nextjs, cnpg, kafka, nats, falco, trivy
├── logging/                 # Grafana Loki configs, Fluentbit collectors, LogQL dashboards
├── messaging/               # Kafka & NATS JetStream configs, producers, and consumers
├── monitoring/              # Grafana dashboards, Prometheus ServiceMonitors, Alertmanager rules
├── opentofu/                # Modular OpenTofu IaC templates (Modules for cert-manager, gateway, falco)
├── rollouts/                # Argo Rollouts progressive delivery canary definitions
├── security/                # Falco runtime detection rules & Trivy container vulnerability scanner
└── storage/                 # Longhorn distributed block storage classes, volumes, and backups
```

---

## Security Considerations
- Sensitive `.env` files and credentials are strictly ignored in `.gitignore`.
- Build artifacts (`.next`, `dist`, `node_modules`) are quarantined from source commits.

## Related Documentation
- [Technology-Stack.md](Technology-Stack.md) — Tooling versions and frameworks.
- [Architecture.md](Architecture.md) — System architecture breakdown.
