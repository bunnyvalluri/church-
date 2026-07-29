# Operational Runbook: Helm Release Recovery

## 1. Trigger Conditions & Diagnostics
Execute this runbook when:
- A Helm release is stuck in `pending-install`, `pending-upgrade`, or `failed` state.
- `helm status <release-name> -n <namespace>` reports an unrecoverable failure.

---

## 2. Immediate Diagnostic Steps
```bash
# Check status of failing release
helm status backend -n kcm-production

# Inspect release history and revision logs
helm history backend -n kcm-production

# Check secret state storing Helm release metadata
kubectl get secrets -n kcm-production -l owner=helm,name=backend
```

---

## 3. Recovery Procedure for Stuck Releases

### Step 1: Force Release Secret Unlocking
If the release is stuck in `pending-upgrade`:
```bash
# Identify the stuck revision secret
STUCK_SECRET=$(kubectl get secrets -n kcm-production -l owner=helm,name=backend,status=pending-upgrade -o jsonpath='{.items[0].metadata.name}')

# Delete stuck release secret safely
kubectl delete secret $STUCK_SECRET -n kcm-production
```

### Step 2: Rollback to Last Known Good Revision
```bash
# Rollback to revision N-1
helm rollback backend 4 -n kcm-production --wait --timeout 5m
```

### Step 3: Trigger Argo CD Force Sync
```bash
# Force Argo CD to synchronize state
argocd app sync kcm-backend --force --prune
```
