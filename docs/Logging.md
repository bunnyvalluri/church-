# Centralized Logging Stack Guide - Loki & Promtail

## 1. Logging Architecture

Centralized logging is powered by **Grafana Loki** and **Promtail**:
- **Promtail**: DaemonSet deployed on every node, capturing stdout/stderr logs from all running containers, K8s audit logs, and host logs (`/var/log`).
- **Loki**: Log aggregation server indexing labels rather than full text, providing high speed and low storage overhead.
- **Grafana**: Primary log search and visualization interface integrated with Prometheus metrics.

---

## 2. Querying Logs with LogQL

In Grafana Explore panel (Datasource: Loki):

```logql
# Query all logs from frontend app
{namespace="kcm-prod", app_kubernetes_io_name="kcm-frontend"}

# Filter for error logs in backend microservices
{namespace="kcm-prod", container="api"} |= "error"

# Query HTTP request latencies > 500ms
{namespace="kcm-prod"} | json | duration > 500ms
```
