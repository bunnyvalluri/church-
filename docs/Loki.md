# Grafana Loki Log Aggregation Engine

## Purpose
This document provides the technical specification for Grafana Loki, the scalable, horizontally partitionable log aggregation system used to collect, index, and query application and infrastructure logs across the Kingdom of Christ Ministries platform.

## Scope
Covers Loki Helm configurations (`platform/logging/helm/`), Fluentbit/Promtail collector DaemonSets (`platform/logging/collectors/`), and LogQL operational querying.

## Status
> Status: Implemented

---

## 1. Loki Architecture & Log Ingestion Pipeline

```mermaid
graph TD
    subgraph Container Node Runtime
        K8sPods[Kubernetes Pod Containers] --> ContainerLogs[/var/log/pods/*/*.log]
        FluentbitDaemon[Fluentbit / Promtail Collector DaemonSet] --> ContainerLogs
    end

    subgraph Loki Ingestion Pipeline
        FluentbitDaemon -->|HTTP POST JSON Chunks :3100| LokiDistributor[Loki Distributor / Gateway]
        LokiDistributor --> LokiIngester[Loki Ingester StatefulSet]
        LokiIngester --> LokiStorage[(Longhorn Loki StorageClass: 30-Day Retention)]
    end

    subgraph Log Exploration & Visualization
        GrafanaUI[Grafana Dashboard Explore UI] -->|LogQL Queries| LokiQuerier[Loki Query Frontend]
        LokiQuerier --> LokiStorage
    end
```

---

## 2. Log Ingestion & Labeling Strategy

Unlike traditional heavyweight indexers (Elasticsearch), Loki indexes only metadata labels, drastically reducing storage footprint and CPU overhead:
- **Indexed Labels**: `namespace`, `app`, `container`, `pod`, `level`.
- **Dynamic Content Filtering**: Body text, JSON fields, and correlation IDs are parsed dynamically at query time using LogQL.

---

## 3. LogQL Query Examples

### 3.1 Filter Application Errors in Real-Time
```logql
{namespace="kcm-system", app="kcm-frontend"} | json | level="ERROR"
```

### 3.2 Trace Specific User Action by Correlation ID
```logql
{namespace="kcm-system"} | json | correlationId="req_8f7e6d5c-4b3a-2a1b"
```

### 3.3 Compute Error Rates per Minute
```logql
sum(rate({namespace="kcm-system"} | json | level="ERROR" [1m])) by (app)
```

---

## 4. Storage & Retention Policies

- **StorageClass**: `longhorn-loki` (Replicated distributed block volume).
- **Retention Period**: `30 Days` (Configured via `table_manager.retention_period: 720h`).
- **Chunk Compaction**: Compressed with snappy/gzip, achieving an average 85% storage reduction.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `429 Too Many Requests: entry with timestamp older than current oldest` | Clock skew between worker nodes and Loki ingester | Enable NTP synchronization across all Kubernetes host nodes. |
| LogQL query times out on large time range | Querying multiple days without label narrowing | Add restrictive label selectors (e.g. `{app="kcm-backend", level="ERROR"}`) before running broad text searches. |

---

## Security Considerations
- Multi-tenancy headers (`X-Scope-OrgID`) isolate production logs from staging environments.
- Logs are stored on encrypted Longhorn block storage volumes.

## Related Documentation
- [Logging.md](Logging.md) — Application logging schema.
- [Grafana.md](Grafana.md) — Dashboards and log exploration.
- [Longhorn.md](Longhorn.md) — Persistent storage tier.
