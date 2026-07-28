# Observability Platform Troubleshooting Guide

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## Common Issues & Diagnostics

### 1. Grafana Pod Failing Liveness / Readiness Probes
- **Symptom**: Pod status `CrashLoopBackOff` or `Unhealthy`.
- **Diagnostic Command**: `kubectl describe pod -l app.kubernetes.io/name=grafana -n monitoring`
- **Resolution**:
  - Verify PostgreSQL connectivity: `kubectl exec -it <grafana-pod> -n monitoring -- nc -zv kcm-postgresql 5432`.
  - Check PV volume mount permissions (`chown 472:472`).

### 2. Datasource Connection Error ("HTTP Error Bad Gateway / Connection Refused")
- **Symptom**: Grafana UI shows red banner on Prometheus or Loki datasources.
- **Resolution**:
  - Verify Prometheus service DNS: `http://prometheus-k8s.monitoring.svc.cluster.local:9090`.
  - Verify NetworkPolicy permits Grafana -> Prometheus egress.

### 3. Dashboard Sidecar Not Syncing New Dashboards
- **Symptom**: Dashboard JSON added to Git but missing in Grafana.
- **Resolution**:
  - Verify ConfigMap label includes `grafana_dashboard: "1"`.
  - Check sidecar log: `kubectl logs -l app.kubernetes.io/name=grafana -n monitoring -c grafana-sc-dashboard`.
