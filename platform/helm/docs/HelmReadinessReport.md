# Helm Readiness Report - Kingdom of Christ Ministries (KCM Church)

## Executive Summary
This document provides a comprehensive readiness assessment of the **Kingdom of Christ Ministries (KCM Church)** Kubernetes platform prior to enterprise Helm packaging, GitOps deployment, and OCI registry distribution.

---

## 1. Cluster & Infrastructure Baseline

| Component | Target Spec / Version | Helm Compatibility | Assessment Notes |
| :--- | :--- | :--- | :--- |
| **Kubernetes API** | v1.28+ / v1.30+ | Helm v3.14.0+ | Full support for OpenAPI v3 validation and CRD v1 schemas |
| **Ingress & Gateway** | Envoy Gateway v1.0+ / Istio v1.20+ | Helm 3 native | Supports standard Ingress, HTTPRoute (Gateway API), and VirtualServices |
| **Storage Engine** | Longhorn v1.6+ | Helm 3 Helm Hooks | CSI StorageClass binding with dynamic volume provisioning |
| **Database Engine** | CloudNativePG v1.22+ | Custom Resource Templates | Operator CRDs managed via Helm CRD hooks |
| **Observability** | Prometheus Operator v0.70+ | ServiceMonitor CRDs | Helm standard chart telemetry integration |
| **Security Runtime** | Falco v0.37+ & Trivy v0.50+ | DaemonSet / Helm CRDs | Kernel security tracing and continuous vulnerability scanning |

---

## 2. Namespace & Microservice Segmentation

The cluster target topology is partitioned into standard isolated namespaces:

```
kcm-production/         # Production workloads (Next.js, Node.js Backend)
kcm-staging/            # Staging workloads
kcm-development/        # Development sandbox
kcm-database/           # CloudNativePG & Redis HA clusters
kcm-messaging/          # Apache Kafka KRaft & NATS JetStream
kcm-system/             # Longhorn, Velero, cert-manager
kcm-mesh/               # Istio Service Mesh & Envoy Gateway
kcm-observability/      # Grafana, Prometheus, Loki, Jaeger
kcm-security/           # Falco, Trivy Operator
argocd/                 # Argo CD GitOps Controllers
```

---

## 3. Workload Readiness Analysis

### 3.1 Frontend (`nextjs`)
- **Container Strategy**: Multi-stage Docker image, standalone output mode.
- **Helm Strategy**: Deployment + Service + HTTPRoute / Ingress + HPA (CPU > 75%) + PodDisruptionBudget (minAvailable: 1).
- **Probes**: Liveness (`/api/healthz`), Readiness (`/api/healthz`), Startup (`/api/healthz`).

### 3.2 Backend (`backend`)
- **Container Strategy**: Node.js + Express.js + Prisma ORM.
- **Helm Strategy**: Deployment + Service + ConfigMap + Secret + HPA + ServiceMonitor + Database migration pre-install/pre-upgrade Helm hook Job.
- **Dependencies**: PostgreSQL (`cloudnativepg`), Redis, Kafka, NATS.

### 3.3 Stateful Services (`cloudnativepg`, `redis`, `kafka`, `nats`, `longhorn`)
- **State Strategy**: High availability with persistent volume claims bound to Longhorn `longhorn-crypto` or `longhorn-fast` storage classes.
- **Helm Strategy**: StatefulSets / Operator CRDs wrapped in modular Helm subcharts with `values-production.yaml` anti-affinity and multi-AZ replica placement.

---

## 4. Configuration & Secret Management Readiness
- **ConfigMaps**: Parameterized via `values.yaml` environment keys (`NODE_ENV`, `LOG_LEVEL`, `KAFKA_BROKERS`, etc.).
- **Secrets**: Integrated with sealed-secrets / ExternalSecrets / SOPS. Sensitive keys (`DATABASE_URL`, `JWT_SECRET`, `FIREBASE_ADMIN_CREDENTIALS`) passed securely via Kubernetes Secret references.

---

## 5. Helm Packaging Recommendations & Action Plan
1. Establish standard API v2 chart definitions for all 15 microservices/components.
2. Publish packaged charts to GitHub Container Registry (`oci://ghcr.io/bunnyvalluri/church-/charts`).
3. Deploy charts through Argo CD using GitOps ApplicationSet pattern.
4. Enforce Cosign digital signature verification prior to installation.
