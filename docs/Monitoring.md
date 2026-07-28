# Observability & Monitoring Setup Guide

## 1. Stack Components

The observability stack resides in the `monitoring` namespace:
- **Prometheus Operator**: Collects infrastructure and application metrics via ServiceMonitors.
- **Grafana**: Visualizes metrics with production dashboards.
- **Alertmanager**: Routes critical alerts to Slack / PagerDuty / Email.
- **kube-state-metrics**: Exposes K8s object health state.
- **node-exporter**: Collects host hardware and OS metrics.

---

## 2. Key Monitored Metrics

| Metric Category | PromQL Expression | Alert Threshold |
|---|---|---|
| **HTTP 5xx Errors** | `sum(rate(http_requests_total{status=~"5.*"}[5m])) / sum(rate(http_requests_total[5m])) * 100` | Alert if > 1% for 2 minutes |
| **Pod CrashLoop** | `rate(kube_pod_container_status_restarts_total[5m]) * 60` | Alert if > 2 restarts/min |
| **DB Memory Usage** | `container_memory_usage_bytes{container="postgres"} / container_spec_memory_limit_bytes{container="postgres"} * 100` | Alert if > 85% for 5 minutes |
| **Redis Memory** | `redis_memory_used_bytes / redis_memory_max_bytes * 100` | Alert if > 80% for 5 minutes |
