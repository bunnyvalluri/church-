# Platform Operations Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## Standard Operating Procedures (SOP)

### 1. Grafana Deployment & Rolling Updates
- **Helm Upgrade**:
  ```bash
  helm upgrade --install grafana grafana/grafana \
    --namespace monitoring \
    --values monitoring/helm/values-grafana.yaml
  ```
- **Argo CD Automated Sync**:
  Argo CD syncs `kcm-observability-stack` application automatically on main branch push.

### 2. Adding a New Grafana Dashboard
1. Export dashboard JSON from local instance.
2. Save JSON file to `monitoring/dashboards/<dashboard-name>.json`.
3. Commit and push to Git repo; Argo CD and Grafana sidecar automatically provision the new dashboard.

### 3. OpenTofu Provisioning Execution
```bash
cd monitoring/terraform-or-opentofu
tofu init
tofu plan
tofu apply
```
