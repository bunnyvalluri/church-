# Enterprise Helm Charts Guide - KCM Church

## 1. Overview

The platform uses parameterized, production-ready Helm v3 charts stored in `kcm-church-infra/charts/`.

---

## 2. Helm Chart Inventory

| Chart Name | Target Workload | Key Parameters |
|---|---|---|
| `kcm-frontend` | Next.js App Router SSR | `replicaCount`, `autoscaling.enabled`, `ingress.hosts`, `resources` |
| `kcm-backend` | Express API, Worker, Cron | `api.replicaCount`, `worker.enabled`, `cron.enabled`, `env.REDIS_URL` |
| `kcm-redis` | Redis Caching Layer | `replicaCount`, `persistence.size`, `resources` |
| `kcm-postgresql` | PostgreSQL Relational DB | `postgres.database`, `postgres.user`, `persistence.size` |

---

## 3. Helm Validation & Render Commands

Before committing chart updates, run local linting and rendering validation:

```bash
# Lint charts
helm lint kcm-church-infra/charts/kcm-frontend
helm lint kcm-church-infra/charts/kcm-backend

# Render templates with default values
helm template kcm-frontend kcm-church-infra/charts/kcm-frontend
helm template kcm-backend kcm-church-infra/charts/kcm-backend
```
