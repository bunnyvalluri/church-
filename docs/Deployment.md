# Multi-Environment Deployment Architecture

## Purpose
This document specifies the deployment architecture, environment tiers (Local Development, Staging, Production), prerequisites, and release lifecycle for the Kingdom of Christ Ministries platform.

## Scope
Covers local npm workspaces, Docker Compose execution, staging cluster deployments, and production releases.

## Status
> Status: Implemented

---

## 1. Environment Tiers Overview

| Environment | Hosting Target | Database | Domain | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | Local Host / Docker | Local PostgreSQL + Redis (or Mock) | `localhost:3000` | Rapid feature development, hot reloading, unit tests |
| **Staging** | Kubernetes Staging Cluster | CloudNativePG Staging (1-replica) | `staging.kcmchurch.org` | Integration testing, Playwright E2E matrix, user acceptance |
| **Production**| Kubernetes Production Cluster| CloudNativePG 3-Node HA Cluster | `kcmchurch.org` | Live church operations, member giving, live stream streaming |

---

## 2. Local Development Deployment

### Option A: Bare-Metal Concurrent Run (Fastest)
```bash
# 1. Install root monorepo dependencies
npm install

# 2. Generate Prisma Client bindings
npx prisma generate --schema=database/schema.prisma

# 3. Start Frontend (Next.js) and Companion Backend concurrently
npm run dev
```

### Option B: Docker Compose Full Stack
```bash
# Spin up PostgreSQL, Redis, Frontend, and Backend containers
npm run docker:dev
```

---

## 3. Staging Deployment Workflow

1. Push to `staging` branch triggers `.github/workflows/ci.yml`.
2. Playwright E2E test suites execute against the staging environment.
3. Automated security scans verify container images and Helm charts.
4. Argo CD deploys workloads to the `kcm-staging` namespace.

---

## 4. Production Deployment Workflow

1. Pull Request merged into `main` branch.
2. Production multi-arch container image is built and pushed to GHCR.
3. Argo CD synchronizes updated GitOps manifests.
4. Argo Rollouts executes a 4-stage progressive Canary deployment with real-time Prometheus error rate analysis.

---

## 5. Post-Deployment Verification Commands

```bash
# 1. Verify health probes
curl -f https://kcmchurch.org/api/health
curl -f https://kcmchurch.org/api/ready

# 2. Run automated production smoke test suite
npm run test:smoke -w frontend

# 3. Check Kubernetes pod status
kubectl get pods -n kcm-system -l app.kubernetes.io/name=kcm-frontend
```

---

## 6. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Local server crashes on startup with database error | `DATABASE_URL` missing or invalid in `.env.local` | Ensure PostgreSQL is running locally on port 5432 or set `DB_OFFLINE="true"`. |
| Staging deployment blocked | Playwright E2E test suite failed in CI | Inspect Playwright test report artifacts in GitHub Actions summary. |

---

## Security Considerations
- Production secrets are injected dynamically at runtime via Kubernetes Secrets.
- Database migrations execute automatically during pre-sync hooks before traffic routing.

## Related Documentation
- [Production-Deployment.md](Production-Deployment.md) — Comprehensive production release runbook.
- [CI-CD.md](CI-CD.md) — CI/CD automation pipelines.
- [try.md](try.md) — Step-by-step practical setup guide.
