# Observability Architecture

**Project**: Kingdom of Christ Ministries (KCM Church)  
**Classification**: Enterprise Technical Architecture Specification  

---

## Architecture Blueprint

The KCM Observability Platform is built on native Cloud-Native Computing Foundation (CNCF) and official Grafana ecosystem standards.

```
+-----------------------------------------------------------------------------------+
|                                 Telemetry Sources                                 |
|  +------------------+  +-------------------+  +-----------------+  +------------+ |
|  | Express Backend  |  | Next.js Frontend  |  | PostgreSQL DB   |  | Redis      | |
|  | (/metrics)       |  | (Web Vitals)      |  | (pg_exporter)   |  | (exporter) | |
|  +--------+---------+  +---------+---------+  +--------+--------+  +-----+------+ |
+-----------|----------------------|-------------------|-------------------|--------+
            |                      |                   |                   |
            v                      v                   v                   v
+-----------------------------------------------------------------------------------+
|                             Prometheus & Loki Stack                               |
|  +-------------------------------------+  +------------------------------------+  |
|  | Prometheus Time Series TSDB (9090)  |  | Loki Centralized Log Server (3100) |  |
|  +------------------+------------------+  +-----------------+------------------+  |
+---------------------|---------------------------------------|---------------------+
                      |                                       |
                      v                                       v
+-----------------------------------------------------------------------------------+
|                        Official Grafana Enterprise Core                           |
|  +-----------------------------------------------------------------------------+  |
|  | Multi-Replica HA Grafana Instance (StatefulSet / Deployment + PVC + Ingress) |  |
|  | Datasources: Prometheus, Loki, PostgreSQL, Redis, Alertmanager              |  |
|  +--------------------------------------+--------------------------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            Alertmanager Routing Engine                            |
|  +-------------+  +---------------+  +------------------+  +-------------------+  |
|  | Email (SRE) |  | Slack Channel |  | MS Teams Webhook |  | Discord Community |  |
|  +-------------+  +---------------+  +------------------+  +-------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## Key Principles
1. **Zero Source Code Modification**: Deploys the official `grafana/grafana` image directly.
2. **GitOps & Declarative IaC**: All dashboards, datasources, and alert policies are stored in Git (`monitoring/`) and synced via Argo CD and OpenTofu.
3. **High Availability**: Multi-replica pod deployment with sticky sessions, externalized PostgreSQL state database, and Redis session store.
