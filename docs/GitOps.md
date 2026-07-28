# GitOps Repository Architecture & Workflow Guide

## 1. Dual Repository Model

To adhere strictly to GitOps security best practices, application source code is completely separated from infrastructure configuration:

### Repository 1: `kcm-church-app`
- **Purpose**: Application source code, component logic, database schemas, Dockerfiles, unit tests, and GitHub Actions CI pipelines.
- **Access**: Full read/write access for application developers.
- **Trigger**: Every push or pull request runs linting, tests, security scanning, multi-arch Docker image builds, and pushes signed tags to `ghcr.io`.

### Repository 2: `kcm-church-infra`
- **Purpose**: Declarative Kubernetes state, Helm charts, Argo CD AppProjects, Application specs, environment values (`dev`, `staging`, `prod`), NetworkPolicies, and Observability configs.
- **Access**: Strictly controlled access (DevOps / Release Engineers / Argo CD Service Account).
- **Trigger**: Automatically updated by GitHub Actions bot on image releases, triggering continuous reconciliation by Argo CD.

---

## 2. Directory Layout of `kcm-church-infra`

```
kcm-church-infra/
├── argocd/
│   ├── installation/          # Official Argo CD HA deployment manifests
│   ├── projects/              # Argo CD AppProjects (frontend, backend, db, monitoring, etc.)
│   ├── applications/          # Root App-of-Apps and individual Application CRDs
│   ├── argocd-cm.yaml         # System ConfigMap
│   ├── argocd-rbac-cm.yaml    # Least-privilege RBAC CSV definition
│   ├── argocd-secret.yaml     # Initial admin hash & secret keys
│   ├── ingress.yaml           # TLS Ingress for Argo CD console
│   └── sync-windows.yaml      # Service blackout and maintenance windows
├── charts/
│   ├── kcm-frontend/          # Production Next.js Helm Chart
│   ├── kcm-backend/           # Node.js API, Worker, Cron Helm Chart
│   ├── kcm-redis/             # Redis HA StatefulSet Chart
│   ├── kcm-postgresql/        # PostgreSQL HA StatefulSet Chart
│   ├── kcm-monitoring/       # Monitoring Helm Chart
│   └── kcm-ingress-certmanager/# Ingress & Cert-Manager Chart
├── rollouts/
│   ├── rollout-frontend.yaml  # Argo Rollouts Canary specification
│   └── rollout-backend.yaml   # Argo Rollouts Blue-Green specification
├── security/
│   ├── network-policies/      # Microsegmentation NetworkPolicies
│   ├── pod-security-standards/# Restricted PSS profiles
│   ├── rbac/                  # Workload RBAC bindings
│   ├── cert-manager/          # ClusterIssuer specs
│   └── secrets-management/    # ExternalSecrets / SealedSecrets templates
├── observability/
│   ├── prometheus-stack.yaml  # Prometheus Operator & exporters
│   ├── loki-stack.yaml        # Loki + Promtail logging engine
│   └── alertmanager-rules.yaml# Production alerting rules
├── autoscaling/               # HPA v2 and VPA specs
├── disaster-recovery/         # Database backup CronJob and DR script
└── environments/              # Environment overrides (dev, staging, prod)
```
