# Prometheus Metric Collection & Recording Rules

## Purpose
This document provides the technical specification for Prometheus metrics collection, scraping targets, custom application metrics, recording rules, and Alertmanager integrations across the Kingdom of Christ Ministries infrastructure.

## Scope
Covers Prometheus Operator manifests, ServiceMonitors, PodMonitors (`platform/database/monitoring/cnpg-pod-monitor.yaml`), and metric instrumentation in Next.js and Express.

## Status
> Status: Implemented

---

## 1. Prometheus Architecture & Scrape Architecture

```mermaid
graph TD
    PromServer[Prometheus Operator Controller]
    
    subgraph ServiceMonitors & PodMonitors
        SM_Frontend[ServiceMonitor: kcm-frontend]
        SM_Backend[ServiceMonitor: kcm-backend]
        PM_CNPG[PodMonitor: kcm-db-cluster]
        SM_Redis[ServiceMonitor: kcm-redis]
        SM_Falco[ServiceMonitor: falco-exporter]
    end

    PromServer --> SM_Frontend
    PromServer --> SM_Backend
    PromServer --> PM_CNPG
    PromServer --> SM_Redis
    PromServer --> SM_Falco

    subgraph Storage & Evaluation
        PromStorage[(Longhorn Fast NVMe Storage: 15-Day Retention)]
        PromRules[Alert & Recording Rules Evaluator (15s Loop)]
    end

    PromServer --> PromStorage
    PromServer --> PromRules
```

---

## 2. Core Application Metrics

Instrumented via `prom-client` in `backend/src/metrics.js` and Next.js metrics endpoints:

| Metric Name | Type | Description | Labels |
| :--- | :--- | :--- | :--- |
| `http_requests_total` | Counter | Total incoming HTTP requests | `method`, `route`, `status_code` |
| `http_request_duration_seconds` | Histogram | Request latency distribution in seconds | `method`, `route`, `le` (buckets: 0.05 to 10s) |
| `active_socket_connections` | Gauge | Current active WebSocket connections | `namespace`, `branch` |
| `bullmq_jobs_completed_total` | Counter | Total successfully processed background jobs | `queue_name` |
| `bullmq_jobs_failed_total` | Counter | Total failed background jobs | `queue_name`, `error_type` |
| `pg_pool_active_connections` | Gauge | Active connections currently leased from pool | `pool_name` |
| `donations_processed_total` | Counter | Total donation transactions completed | `gateway`, `currency`, `purpose` |

---

## 3. Metric Recording Rules

Pre-computed recording rules reduce dashboard load times by aggregating raw time-series data:
- **`job:http_requests:rate5m`**: Calculates the 5-minute request per second (RPS) rate.
- **`job:http_request_duration_seconds:p95`**: Pre-computes the 95th percentile latency per route.

---

## 4. Retention & Storage Configuration

- **Storage Class**: `longhorn-fast` (High-IOPS persistent storage).
- **Volume Size**: `50Gi`.
- **Retention Time**: `15d` (15 Days).
- **Scrape Interval**: `15s` globally; `5s` for critical database cluster metrics.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Metric scraping returning `404 Not Found` | Application pod missing `/metrics` route handler | Ensure `prom-client` middleware is registered before general 404 handlers in `backend/server.js`. |
| Prometheus storage disk filling up | High-cardinality metric labels (e.g. user IDs or timestamps in labels) | Remove high-cardinality labels from custom metrics; keep labels limited to low-cardinality enums. |

---

## Security Considerations
- The internal `/metrics` endpoint is protected by NetworkPolicies, accessible only by the Prometheus scraper pod.

## Related Documentation
- [Monitoring.md](Monitoring.md) — Alert rules and notification policies.
- [Grafana.md](Grafana.md) — Visualizing Prometheus metrics.
- [Observability.md](Observability.md) — Unified telemetry architecture.
