# Operational Runbook: Helm Disaster Recovery & State Restoration

## 1. Scope & Objective
Restore full Helm cluster state and release metadata from Velero object storage backups following total cluster loss or data corruption.

---

## 2. Restore Procedure

### Step 1: Restore Helm Release Secrets via Velero
```bash
# Get available Velero backups
velero backup get

# Restore latest cluster backup
velero restore create --from-backup kcm-daily-backup-20260729 --include-resources secrets,configmaps --include-namespaces kcm-production,kcm-staging,argocd
```

### Step 2: Re-apply Argo CD Root ApplicationSet
```bash
# Apply root GitOps ApplicationSet
kubectl apply -f platform/helm/charts/argocd/templates/applicationset.yaml
```

### Step 3: Validate Helm Release Integrity
```bash
# Verify release metadata across all namespaces
helm list --all-namespaces
```
