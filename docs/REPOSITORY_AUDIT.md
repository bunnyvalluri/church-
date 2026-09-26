# Repository Audit — Kingdom of Christ Ministries (KCM) Platform

## Executive Summary
This document represents an exhaustive, verified technical audit of the **Kingdom of Christ Ministries (`church-`) monorepo**. The platform is an enterprise-grade digital ministry hub supporting multilingual congregational experiences, live video broadcasting, automated 80G tax-exempt donation processing, sermon archiving, pastoral management, prayer wall request queuing, and real-time community engagement.

---

## Phase 0 & 1 Metadata
- **Current Branch**: `main`
- **Current Commit SHA**: `4ca5218bdac561a6da04fde376111fbdec2e64df`
- **Monorepo Manager**: NPM Workspaces (`package.json`) with workspaces `frontend` and `backend`
- **Target Production Host**: `https://kcmchurch.vercel.app`

---

## 1. System Architecture & Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KCM CHURCH ECOSYSTEM                            │
└────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     Next.js 14 Web App        │               │   Node.js / Express Backend   │
│  (Edge Middleware, React 18,  │               │   (BullMQ, Redis Adapter,     │
│   Tailwind CSS, Playwright)   │               │   Prometheus, Twilio/Resend)  │
└───────────────────────────────┘               └───────────────────────────────┘
            │                                               │
            ├───────────────────────┬───────────────────────┤
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
│ Neon Serverless /     │ │ Cloudinary &      │ │ Razorpay / Stripe     │
│ CloudNativePG (Postgres)│ Firebase Cloud    │ │ Payment Webhooks      │
│ Prisma ORM            │ │ Storage & Auth    │ │ (HMAC-SHA256 Auth)    │
└───────────────────────┘ └───────────────────┘ └───────────────────────┘
```

---

## 2. Directory Responsibilities & Structure

| Directory | Purpose / Ownership |
| :--- | :--- |
| `frontend/` | Next.js 14 App Router application. Contains client & server components, edge middleware (`middleware.ts`), i18n dictionaries (EN/TE/HI), UI themes, and API route handlers. |
| `backend/` | Express.js 5 microservice engine for background cron jobs, async email/SMS message queues (BullMQ/Redis), socket broadcasting, and AI agent reach endpoints. |
| `database/` | Central Prisma schema definitions (`schema.prisma`), database seeding scripts, and CloudNativePG configuration. |
| `platform/` | Helm charts, Envoy Gateway manifests, OpenTofu infrastructure configs, and Trivy security policies. |
| `k8s/` | Kubernetes production manifests, deployment configurations, services, and secret templates. |
| `docker/` | Docker compose setups for dev and production staging environments. |
| `nginx/` | Reverse proxy configurations, TLS termination, and rate-limiting rules. |
| `monitoring/` | Prometheus scrape targets, Grafana dashboards, and Alertmanager notification rules. |
| `health/` | Custom synthetic health checks, database probes, and security scan health suites. |
| `scripts/` | Tooling for quality agents, multilingual audits, sitemap generation, and SEO diagnostics. |
| `.github/` | CI/CD GitHub Actions workflows for continuous integration, linting, testing, and GitOps deployments. |
| `.agent/` & `.agents/` | AI development workflow runbooks and domain-specific skills (e.g. Firecrawl web search). |
| `.jcode/` | JCode multi-session harness metadata, session blueprints, and MCP server configuration. |
| `docs/` | Architectural specifications, security checklists, runbooks, and audit logs. |

---

## 3. Technology Stack Inventory

- **Frontend Framework**: Next.js 14.2.0 (App Router, Server Components, Edge Middleware, Lucide React, Framer Motion)
- **Styling**: Tailwind CSS 3.4.0 + PostCSS with customized dark/light HSL palettes and glassmorphism design tokens
- **Internationalization (i18n)**: Zero-dependency React Context provider with canonical key parity across English, Telugu (`te`), and Hindi (`hi`) (2,286 synchronized keys)
- **Backend Framework**: Express 5.2.1, Node.js 22 LTS
- **Database**: PostgreSQL 16 (Neon Serverless DB in Cloud / CloudNativePG on Kubernetes) managed via Prisma ORM 5.11.0
- **Realtime / WebSockets**: Socket.IO 4.8.3 with Redis Adapter and strict HTTPS-safe fallback
- **Authentication**: Custom Cryptographic Edge Session (`HMAC-SHA256` Web Crypto) + NextAuth 4.24.0 / Firebase Auth 12.8.0
- **File & Media Storage**: Cloudinary SDK (signed direct uploads) + Firebase Cloud Storage
- **Payment Gateways**: Razorpay 2.9.6 (UPI QR, NetBanking, Cards) + Stripe 14.21.0
- **Notifications**: Resend 6.18.1 (Transactional Email), Twilio 6.0.2 / HttpSMS (SMS Alerts)
- **Testing Engine**: Playwright 1.62.1 (E2E, Security, RBAC Matrix, Accessibility, Cross-Browser, Responsive, Smoke)
- **CI/CD**: GitHub Actions (Least-privilege read-only default tokens, strict lint, typecheck, build validation)

---

## 4. Boundaries & Isolation

1. **API Boundaries**:
   - `/api/admin/*`: Restricted to `SUPER_ADMIN` and `ADMIN` roles. Enforced at Edge middleware and inside route handlers.
   - `/api/pastor/*`: Restricted to `PASTOR`, `ADMIN`, and `SUPER_ADMIN` roles.
   - `/api/event-manager/*`: Restricted to `EVENT_MANAGER`, `FIELD_VOLUNTEER`, `ADMIN`, `SUPER_ADMIN`.
   - `/api/donations/*` & `/api/payments/*`: Public creation with cryptographic signature verification on webhook receipt.
2. **Database Boundaries**:
   - Never exposes raw connection strings to client bundles. All Prisma calls run in server execution contexts or serverless functions.
3. **Frontend Isolation**:
   - `NEXT_PUBLIC_*` strictly scoped to non-sensitive identifiers (Razorpay Key ID, Cloudinary Cloud Name, Firebase Project ID).
   - Sensitive API secrets (`CLOUDINARY_API_SECRET`, `RAZORPAY_KEY_SECRET`, `DATABASE_URL`) never prefixed with `NEXT_PUBLIC_`.
