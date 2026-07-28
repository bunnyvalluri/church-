# Centralized Logging Specification (Loki Stack)

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## 1. Loki Architecture & Ingestion
- **Aggregator**: Loki TSDB engine running on port 3100.
- **Log Collector**: Promtail DaemonSet on each node.
- **Configuration**: `monitoring/helm/values-loki.yaml`.
- **Retention Period**: 30 Days (720 hours).

## 2. Supported Log Formats
- **Container stdout/stderr**: Parsed via Promtail CRI pipeline stage.
- **JSON Application Logs**: Automatically extracts `level`, `message`, `status`, `latency`, and `trace_id`.
- **NGINX Access Logs**: Structured access log parsing for remote IP, status, user agent, and request duration.
- **Audit Logs**: Kubernetes control plane audit events.
