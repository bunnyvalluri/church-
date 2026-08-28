# Grafana Visualizations & Operational Dashboards

## Purpose
This document specifies the Grafana visualization architecture, multi-source datasource configurations, dashboard definitions, and high-availability deployment for the Kingdom of Christ Ministries platform.

## Scope
Covers Grafana HA deployment (`monitoring/kubernetes/grafana-ha-deployment.yaml`), provisioned datasources (`monitoring/datasources/`), and dashboard JSON models (`monitoring/dashboards/`).

## Status
> Status: Implemented

---

## 1. Grafana Architecture & Datasource Integrations

```mermaid
graph TD
    subgraph Data Sources Layer
        DS_Prom[Prometheus: Time-Series Metrics]
        DS_Loki[Grafana Loki: Aggregated Log Streams]
        DS_PG[PostgreSQL: Direct Business Query Read-Replica]
        DS_Redis[Redis: In-Memory Telemetry]
        DS_Alert[Alertmanager: Active Alert Silences & History]
    end

    subgraph Grafana Server (HA Deployment)
        GrafanaCore[Grafana HA StatefulSet Pods]
        GrafanaStorage[(Longhorn PVC: grafana-pvc)]
    end

    DS_Prom --> GrafanaCore
    DS_Loki --> GrafanaCore
    DS_PG --> GrafanaCore
    DS_Redis --> GrafanaCore
    DS_Alert --> GrafanaCore
    GrafanaCore --- GrafanaStorage

    subgraph Operational Dashboards
        GrafanaCore --> DB_App[App Overview Dashboard]
        GrafanaCore --> DB_Backend[Express & Socket.io Dashboard]
        GrafanaCore --> DB_Postgres[CloudNativePG Performance Dashboard]
        GrafanaCore --> DB_Cluster[Kubernetes Cluster Infrastructure]
        GrafanaCore --> DB_Trivy[Trivy Vulnerability Security Overview]
    end
```

---

## 2. Provisioned Datasources (`monitoring/datasources/`)

- **`prometheus.yaml`**: `http://prometheus-operated.monitoring.svc:9090` (Default time-series source).
- **`loki.yaml`**: `http://loki-gateway.logging.svc:3100` (Log exploration source).
- **`postgresql.yaml`**: Reads from PostgreSQL read-only replica for high-level pastoral financial trends.
- **`alertmanager.yaml`**: Connects to `http://alertmanager-operated.monitoring.svc:9093`.

---

## 3. Pre-Configured Dashboard Catalog

1. **`app-overview.json`**: Real-time traffic, request rates, HTTP 2xx/4xx/5xx status splits, and P95 latency graphs.
2. **`express-backend.json`**: WebSocket connection volume, memory leak diagnostics, and external API latencies (Gemini, Cloudinary, Resend).
3. **`postgresql-performance.json`**: Transaction throughput (TPS), active client connections, table sequential scans vs index scans, and replication lag.
4. **`cluster-overview.json`**: Node memory saturation, CPU throttling percentages, and PVC utilization.

---

## 4. User Access & RBAC Controls

- **Admin Role**: Engineering and DevOps staff (manage dashboards, alerts, and datasources).
- **Editor Role**: Pastoral and administrative leadership (customize reports and view business metrics).
- **Viewer Role**: Read-only access for internal auditing.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Dashboard panels show "Datasource not found" | Provisioning ConfigMap was updated without restarting Grafana pods | Rollout restart Grafana: `kubectl rollout restart deployment grafana -n monitoring`. |
| Log panel in Grafana fails to query Loki | Loki gateway URL unreachable from Grafana pod | Verify `loki.yaml` datasource endpoint and verify network policy connectivity between `monitoring` and `logging` namespaces. |

---

## Security Considerations
- Default `admin` access credential is generated randomly during OpenTofu installation and stored in a Kubernetes secret.
- Session cookies use `Secure: true` and `SameSite: strict`.

## Related Documentation
- [Monitoring.md](Monitoring.md) — Alerting architecture.
- [Loki.md](Loki.md) — Log collection with Loki.
- [Prometheus.md](Prometheus.md) — Metrics scraping.
