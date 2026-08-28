# Quick Start & Practical Execution Guide (try.md)

## Purpose
This document provides the definitive, step-by-step practical guide to clone, install, configure, build, run, test, containerize, and deploy the entire Kingdom of Christ Ministries (KCM Church) platform.

## Scope
Covers local bare-metal development, Docker Compose orchestration, automated testing suites, and Kubernetes cluster deployment.

## Status
> Status: Implemented & Verified

---

## 1. System Prerequisites

Ensure the following tooling is installed on your local development workstation:

| Tool | Minimum Version | Verification Command |
| :--- | :--- | :--- |
| **Node.js** | `v20.12.0+ LTS` | `node -v` |
| **npm** | `v10.5.0+` | `npm -v` |
| **Git** | `v2.40+` | `git --version` |
| **Docker & Compose** | `v24.0+ / Compose v2.20+` | `docker --version` |
| **kubectl** | `v1.28+` (For K8s deployments) | `kubectl version --client` |
| **Helm** | `v3.14+` (For Helm deployments) | `helm version` |
| **OpenTofu** | `v1.6+` (For IaC provisioning) | `tofu version` |

---

## 2. Clone the Repository

```bash
git clone https://github.com/bunnyvalluri/church-.git
cd church-
```

---

## 3. Install Monorepo Dependencies

Install root and workspace dependencies for both `frontend` and `backend`:

```bash
npm install
```

---

## 4. Environment Configuration

Create your local environment file by copying the provided template:

```bash
# Copy template to .env.local
cp .env.example .env.local
```

### Fast Offline Developer Defaults
The default `.env.example` is pre-configured with offline development flags enabled:
```dotenv
# Database offline fallback mode
DB_OFFLINE="true"

# MongoDB offline mock mode
MONGODB_OFFLINE="true"

# Firestore offline mock mode
FIRESTORE_OFFLINE="true"

# Cloudinary demo mode
CLOUDINARY_CLOUD_NAME="demo"
CLOUDINARY_API_KEY="1234567890"

# Mock external communications
SMS_PROVIDER="mock"
EMAIL_PROVIDER="mock"
```

---

## 5. Database Initialization (Prisma & PostgreSQL)

If connecting to a live PostgreSQL instance (e.g. local PostgreSQL running on port 5432 or AWS RDS / Neon):

```bash
# 1. Generate Prisma Client TypeScript definitions
npx prisma generate --schema=database/schema.prisma

# 2. Push relational schema to database
npx prisma db push --schema=database/schema.prisma

# 3. Seed initial branches, admin user, and sample sermons
npm run db:seed
```

---

## 6. Run the Application Locally

Start the Next.js Frontend (port 3000) and companion Express / Socket.io Backend (port 3001) concurrently:

```bash
npm run dev
```

Open your browser and navigate to:
- **Church Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Member Dashboard**: [http://localhost:3000/member](http://localhost:3000/member)
- **Pastor Studio**: [http://localhost:3000/pastor](http://localhost:3000/pastor)
- **Admin Console**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Companion Backend Health**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 7. Run Automated Quality & Security Tests

```bash
# Run Route Health Check
npm run test:health

# Run RBAC Security Matrix Test
npm run test:rbac

# Run Mobile Responsive Viewport Tests
npm run test:responsive

# Run Web Accessibility (a11y) Scan
npm run test:a11y

# Run Full Playwright E2E Suite
npm run test:e2e
```

---

## 8. Build for Production

Compile optimized standalone production bundles:

```bash
npm run build
```

---

## 9. Run with Docker Compose

### Development Stack (Hot-Reloading)
```bash
# Spin up PostgreSQL, Redis, Frontend, and Backend
npm run docker:dev

# Teardown containers
npm run docker:dev:down
```

### Production Simulation Stack
```bash
# Build and run production containers
npm run docker:prod

# Teardown production containers
npm run docker:prod:down
```

---

## 10. Deploy to Kubernetes

Deploy the full microservice stack to a local Minikube / Kind or production Kubernetes cluster:

```bash
# 1. Apply Kustomize manifests to kcm-system namespace
npm run k8s:apply

# 2. Inspect running pods, services, and HPA
npm run k8s:status

# 3. Port-forward frontend service to test locally
kubectl port-forward svc/kcm-frontend-service 3000:3000 -n kcm-system
```

---

## 11. Post-Deployment Verification

Verify operational health using CLI probes:

```bash
# 1. Test Liveness Probe
curl -I http://localhost:3000/api/health

# 2. Test Readiness Probe
curl -I http://localhost:3000/api/ready

# 3. Execute Production Smoke Tests
npm run test:smoke -w frontend
```

---

## 12. Troubleshooting Quick Reference

- **Port 3000 or 3001 already in use**: Kill conflicting node processes: `npx kill-port 3000 3001`.
- **Prisma Client generation error**: Run `cd frontend && npx prisma generate`.
- **Missing browser binaries for Playwright**: Run `npx playwright install --with-deps`.

---

## Related Documentation
- [README.md](README.md) — Complete Documentation Index.
- [Troubleshooting.md](Troubleshooting.md) — Comprehensive problem runbooks.
- [Production-Deployment.md](Production-Deployment.md) — Production rollout SOP.
