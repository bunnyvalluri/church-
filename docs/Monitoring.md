# Monitoring & Alerting Architecture

## Purpose
This document provides the technical specification for the monitoring, metrics collection, dashboard visualization, and alerting subsystems across the Kingdom of Christ Ministries infrastructure.

## Scope
Covers Prometheus monitoring rules, Grafana dashboards (`monitoring/dashboards/`), Alertmanager contact points, and operational incident alerting.

## Status
> Status: Implemented

---

## 1. Monitoring & Observability Topology

```mermaid
graph TD
    subgraph Workload Metrics Targets
        FrontendPods[Frontend Next.js: /api/metrics]
        BackendPods[Express Companion: /metrics (prom-client)]
        DBPods[CloudNativePG: metrics exporter:9187]
        RedisPods[Redis Exporter: :9121]
        NodePods[Node Exporters: Host CPU/Disk/Net]
    end

    subgraph Metrics Ingestion & Alerting
        Prometheus[Prometheus Server / Operator]
        Prometheus -->|Scrape Interval: 15s| FrontendPods
        Prometheus -->|Scrape Interval: 15s| BackendPods
        Prometheus -->|Scrape Interval: 15s| DBPods
        Prometheus -->|Scrape Interval: 15s| RedisPods
        Prometheus -->|Scrape Interval: 15s| NodePods
        
        Prometheus -->|Evaluate Alert Rules| Alertmanager[Prometheus Alertmanager]
        Alertmanager -->|Notification Routing| Slack[Slack / Discord Ops Channel]
        Alertmanager -->|SEV-1 Alerts| PagerDuty[On-Call Pager]
    end

    subgraph Visualization
        Grafana[Grafana Dashboard Server] -->|Query Metrics| Prometheus
        Grafana -->|Query Logs| Loki[(Grafana Loki)]
    end
```

---

## 2. Dashboard Catalog (`monitoring/dashboards/`)

| Dashboard Name | File Name | Primary Metrics Displayed |
| :--- | :--- | :--- |
| **Application Overview** | `app-overview.json` | Total HTTP requests, P95/P99 latency, error rates, active user sessions |
| **Express Backend Engine** | `express-backend.json` | Socket.io active connections, BullMQ queue lag, AI API request durations |
| **PostgreSQL Performance**| `postgresql-performance.json`| Active connection pool, transactions/sec, cache hit ratio, slow queries |
| **Redis Cache & Pub/Sub** | `redis-performance.json` | Memory usage, hit/miss ratio, connected clients, pub/sub channels |
| **Kubernetes Cluster** | `cluster-overview.json` | Node CPU/Memory utilization, pod restarts, storage capacity |
| **Argo CD GitOps** | `argocd-gitops.json` | Application sync status, health status, sync durations |

---

## 3. Prometheus Alerting Rules (`monitoring/alerts/`)

### 3.1 Application Alerts (`application-alerts.yaml`)
- **`HighHttpErrorRate`**: Fires if 5xx HTTP responses exceed 2% of total traffic over a 5-minute window.
- **`SlowApiResponseLatency`**: Fires if API P95 latency exceeds 500ms over a 10-minute window.
- **`PaymentWebhookFailures`**: Fires if payment webhook failure rate exceeds 1% over 15 minutes.

### 3.2 Infrastructure Alerts (`infrastructure-alerts.yaml`)
- **`PostgresReplicationLag`**: Fires if standby replica falls behind primary by > 64MB or > 60 seconds.
- **`PodCrashLooping`**: Fires if any production pod restarts more than 3 times in a 10-minute window.
- **`PersistentVolumeLowSpace`**: Fires when Longhorn persistent volume disk free space drops below 15%.

---

## 4. Alert Routing & Notification Policies (`monitoring/notification-policies/`)

- **SEV-1 / Critical**: Immediate push notification to on-call engineer via PagerDuty / Telegram.
- **SEV-2 / Warning**: Post to dedicated Slack `#kcm-ops-alerts` channel.
- **SEV-3 / Info**: Aggregated into daily morning operational summary reports.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Prometheus target is `DOWN` | ServiceMonitor port mismatch or pod network policy blocking Prometheus | Verify target port in `ServiceMonitor` matches container port and check `NetworkPolicy` ingress rules. |
| Grafana dashboard shows "No data" | Datasource Prometheus URL incorrect | Inspect datasource in Grafana settings (`http://prometheus-operated.monitoring.svc:9090`). |

---

## Security Considerations
- Prometheus and Grafana enforce role-based authentication with Admin/Viewer access tiers.
- Alerting webhooks utilize HTTPS endpoints with bearer token authentication.

## Related Documentation
- [Prometheus.md](Prometheus.md) — Detailed scraping configurations.
- [Grafana.md](Grafana.md) — Dashboard setup.
- [Observability.md](Observability.md) — Unified telemetry.
- [Health-Checks.md](Health-Checks.md) — Health check probe specifications.
