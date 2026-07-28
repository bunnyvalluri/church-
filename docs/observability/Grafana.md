# Official Grafana Deployment & Operational Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  
**Grafana Version**: `10.4.1` (Official Upstream Release)  

---

## 1. Deployment Overview

Grafana is deployed into the `monitoring` namespace using the official Grafana Helm chart (`grafana/grafana`).

### Manifest Locations
- **Helm Values**: `monitoring/helm/values-grafana.yaml`
- **Kubernetes Manifests**: `monitoring/kubernetes/grafana-ha-deployment.yaml`
- **Ingress & TLS**: `monitoring/kubernetes/grafana-ingress.yaml`
- **RBAC**: `monitoring/kubernetes/grafana-rbac.yaml`
- **NetworkPolicy**: `monitoring/kubernetes/network-policy.yaml`

---

## 2. High Availability Configuration
- **Replicas**: 2 (Autoscaling up to 5 replicas based on CPU/Memory).
- **Session Provider**: Redis (`kcm-redis.monitoring.svc.cluster.local:6379`, DB 1).
- **Database Backend**: PostgreSQL (`kcm-postgresql.monitoring.svc.cluster.local:5432`, `grafana_db`).
- **Persistent Storage**: AWS `gp3` StorageClass PersistentVolumeClaim (20Gi).
