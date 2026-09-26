# KCM Portal — Production Deployment & Infrastructure Guide

## 1. System Architecture Overview

The Kingdom of Christ Ministries (KCM) portal is architected as a high-availability, hybrid cloud-native platform:
- **Frontend / Edge**: Next.js 14 App Router, pre-rendered static content (SSG), dynamic server actions, edge caching.
- **Backend API**: Node.js microservices with Prisma ORM, Socket.io real-time layer, and BullMQ worker queues.
- **Databases**: Managed Neon PostgreSQL (direct connection pooling) + MongoDB Atlas (unstructured audit logs).
- **Caching & Queues**: Redis instance with TLS and authentication.
- **Media & Assets**: Cloudinary dynamic asset transformations + Firebase Cloud Messaging.
- **Orchestration & Routing**: Kubernetes with Envoy Gateway / Ingress-NGINX, Horizontal Pod Autoscalers (HPA), Pod Disruption Budgets (PDB), and NetworkPolicies.

```
+-----------------------------------------------------------------------------------+
|                            PRODUCTION TRAFFIC FLOW                                |
|                                                                                   |
|  [ User Browser / PWA ]                                                           |
|          | (HTTPS / TLS 1.3)                                                      |
|          v                                                                        |
|  [ Ingress / Envoy Gateway ]                                                      |
|          |                                                                        |
|          +--> /api/* -----------> [ kcm-backend-api Pods ] (Port 3001)           |
|          |                                |                                       |
|          |                                +---> [ Neon PostgreSQL ]              |
|          |                                +---> [ MongoDB Atlas ]                 |
|          |                                +---> [ Redis Cluster ]                 |
|          |                                +---> [ Cloudinary / Resend ]           |
|          |                                                                        |
|          +--> /* ---------------> [ kcm-frontend Pods ] (Port 3000)              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Environment Variables & Secret Classification

All environment configuration follows strict least-privilege classification. Server secrets are strictly quarantined from client bundles.

| Variable Name | Scope | Classification | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Client & Server | PUBLIC | Canonical frontend domain URL |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client & Server | PUBLIC | Firebase Web Client API key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client & Server | PUBLIC | Firebase Project Identifier |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`| Client & Server | PUBLIC | Public Cloudinary bucket name |
| `NEXT_PUBLIC_SOCKET_URL` | Client & Server | PUBLIC | WebSocket Gateway endpoint |
| `DATABASE_URL` | Server Only | SECRET | PostgreSQL connection string |
| `DIRECT_URL` | Server Only | SECRET | Unpooled PostgreSQL migration URI |
| `MONGODB_URI` | Server Only | SECRET | MongoDB Atlas connection string |
| `REDIS_URL` | Server Only | SECRET | Redis caching & queue connection string |
| `NEXTAUTH_SECRET` | Server Only | SECRET | HMAC SHA256 session signing key |
| `CLOUDINARY_API_SECRET` | Server Only | SECRET | Cloudinary media upload signing key |
| `RAZORPAY_KEY_SECRET` | Server Only | SECRET | Razorpay live API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Server Only | SECRET | Razorpay HMAC webhook verifier |
| `RESEND_API_KEY` | Server Only | SECRET | Transactional email delivery key |
| `FIREBASE_PRIVATE_KEY` | Server Only | SECRET | FCM push notification service account |

---

## 3. Container & Build Specifications

### Frontend Container (`docker/Dockerfile`)
- **Base Image**: `node:22-alpine` (Pinned major LTS)
- **Stages**:
  1. `deps`: Resolves dependencies with `npm ci --ignore-scripts`.
  2. `builder`: Generates Prisma clients and compiles standalone Next.js build.
  3. `runner`: Unprivileged user `nextjs:nodejs` (UID 1001), healthcheck on `/api/health/live`.

### Backend Container (`backend/Dockerfile`)
- **Base Image**: `node:22-alpine`
- **Stages**: Multi-stage build running unprivileged user `backend:nodejs` (UID 1001) on port 3001.

---

## 4. Kubernetes Manifests & Resource Allocations

| Workload | Replicas | CPU (Req/Lim) | Memory (Req/Lim) | Health Probes |
| :--- | :--- | :--- | :--- | :--- |
| `kcm-frontend` | 2–10 (HPA) | 200m / 1000m | 256Mi / 1Gi | Startup (5s), Liveness (`/api/health/live`), Readiness (`/api/health/ready`) |
| `kcm-backend-api` | 2–10 (HPA) | 150m / 800m | 256Mi / 512Mi | Startup (5s), Liveness (`/health`), Readiness (`/health`) |
| `kcm-redis` | 1 | 100m / 500m | 128Mi / 512Mi | Redis PING probe |

---

## 5. Deployment & Rollback Strategy

1. **Staging Deployment & Verification**:
   - Push commit to `staging` branch.
   - Run automated unit, E2E, and security checks (`npm test`).
   - Run smoke tests against staging endpoint.
2. **Production Deployment**:
   - Merge verified release to `main`.
   - GitHub Actions publishes immutable image tags: `ghcr.io/bunnyvalluri/kcm-frontend:<GIT_SHA>`.
   - Kubernetes applies RollingUpdate (`maxSurge: 1`, `maxUnavailable: 0`).
3. **Automated Rollback**:
   - If health probes fail or error rate exceeds 1%, deployment halts.
   - Rollback command: `kubectl rollout undo deployment/kcm-frontend -n kcm-system`.

---

## 6. Observability & Telemetry

- **Prometheus Rules**: [`platform/monitoring/prometheus-rules.yaml`](file:///c:/K.C.M-Portal/platform/monitoring/prometheus-rules.yaml)
- **Grafana Dashboards**: [`monitoring/dashboards/`](file:///c:/K.C.M-Portal/monitoring/dashboards)
- **Loki Centralized Logging**: JSON structured log aggregation with trace correlation IDs.
