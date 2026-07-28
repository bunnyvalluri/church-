# Comprehensive Monitoring Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## 1. Metrics Metrics Exporters

### Express Backend Instrumentation
- **Library**: `prom-client` v15
- **Location**: `backend/src/metrics.js`
- **Scrape Endpoint**: `http://<backend-pod>:3001/metrics`
- **Scrape Interval**: 15s

### Exporters & Targets
- **Node Exporter**: Hardware & OS metrics (CPU, Memory, Disk, Network)
- **kube-state-metrics**: Kubernetes object state metrics (Pods, Deployments, PVCs)
- **Postgres Exporter**: Database connection counts, buffer cache metrics
- **Redis Exporter**: Cache memory, key evictions, client counts
- **NGINX Ingress Controller Exporter**: HTTP request rates, SSL cert expiration
