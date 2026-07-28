# Production Dashboards Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## Dashboard Inventory

| Dashboard Name | File Path | Primary Datasource | Description |
|---|---|---|---|
| **Kubernetes Cluster Overview** | `monitoring/dashboards/cluster-overview.json` | Prometheus | Cluster CPU/Memory saturation, node status, pod phase counts |
| **Application Golden Signals** | `monitoring/dashboards/app-overview.json` | Prometheus | Request rate (RPS), p50/p95/p99 latency, 5xx error rate |
| **Express Backend & API** | `monitoring/dashboards/express-backend.json` | Prometheus | Node.js event loop lag, heap memory, REST route latency |
| **PostgreSQL Performance** | `monitoring/dashboards/postgresql-performance.json` | Prometheus | Active DB connections, buffer cache hit ratio, deadlocks |
| **Redis Cache Performance** | `monitoring/dashboards/redis-performance.json` | Prometheus | Memory usage, cache hit/miss ratio, key evictions |
| **Argo CD & GitHub Actions** | `monitoring/dashboards/argocd-gitops.json` | Prometheus | GitOps app sync statuses, CI workflow execution duration |

---

## Auto-Provisioning Mechanism
All dashboard JSON files in `monitoring/dashboards/` are automatically mounted into Grafana pods via Kubernetes ConfigMaps and provisioned on startup via Grafana's sidecar provider.
