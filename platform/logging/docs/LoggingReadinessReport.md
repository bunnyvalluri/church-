# KCM Platform Enterprise Logging Readiness, Storage, & Performance Report

## Phase 1: Infrastructure Audit Summary

### Kubernetes Component Audit

| Component / Layer | Audit Findings | Logging Strategy |
| :--- | :--- | :--- |
| **Namespaces** | `default`, `backend`, `frontend`, `database`, `security`, `monitoring`, `envoy-gateway-system`, `argocd` | Scraped via Grafana Alloy CRI pod log collector using label `namespace` |
| **Pods / Deployments** | Next.js, Node.js API, BullMQ Workers, Socket.io, Envoy Gateway, Falco | Ingestion via `/var/log/pods/*/*/*.log` with structured JSON parsing |
| **StatefulSets** | CloudNativePG PostgreSQL clusters, Redis HA clusters | Ingesting CNPG CSV/JSON stdout and Redis log stream |
| **Ingress / Gateway API** | Envoy Gateway API controllers and data plane proxies | HTTP access log extraction with status code & latency labeling |
| **Security Auditing** | Falco runtime security daemonset, Firebase Auth, RBAC policy logs | Security audit stream tagged `{category="AUDIT"}` and retained for 90 days |
| **Database & Cache** | CloudNativePG PostgreSQL 16, Redis 7, Prisma ORM | Slow queries (>200ms) tracked via Winston logger and alloy parser |

---

## Storage & Capacity Planning Report

- **Estimated Daily Log Volume**: 15 - 25 GB / day (peak traffic).
- **Retention Tier 1 (General Logs)**: 30 Days @ 20 GB/day = ~600 GB raw (compressed with `snappy` to ~120 GB).
- **Retention Tier 2 (Security & Audit Logs)**: 90 Days @ 2 GB/day = ~180 GB raw (compressed to ~36 GB).
- **Total Storage Requirement**: ~160 GB Object Storage (S3 / Persistent Volume storage).

---

## Performance & Scalability Benchmark

- **Target Ingestion Throughput**: 32 MB/s burst, 16 MB/s sustained.
- **Query Parallelism**: 32 concurrent split-queries across 3 read replicas.
- **Resource Footprint**:
  - Loki Ingesters/Write: 3 Replicas (3 CPU / 6Gi RAM Total)
  - Loki Queriers/Read: 3 Replicas (1.5 CPU / 3Gi RAM Total)
  - Alloy DaemonSet: ~100m CPU / 256Mi RAM per node.
