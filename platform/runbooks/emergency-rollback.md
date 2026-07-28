# Operational Runbook: Emergency Rollback Procedure

## Overview
This runbook provides step-by-step instructions for executing an immediate emergency rollback of a active or canary Argo Rollout in the **Kingdom of Christ Ministries (KCM Church)** production environment.

## 🚨 Emergency Trigger Conditions
Execute an emergency rollback immediately if any of the following occur:
- Critical application crash impacting >5% of users.
- Database connection pool exhaustion or data corruption risk.
- Firebase Authentication failure preventing member login.
- Security vulnerability identified in the running image.

## Step 1: Execute Instant Abort / Rollback Command

### For Frontend Canary (`kcm-frontend`)
```bash
# Abort current canary step and revert 100% traffic to previous stable revision instantly
kubectl argo rollouts abort kcm-frontend -n kcm-system

# Rollback rollout to previous revision
kubectl argo rollouts undo kcm-frontend -n kcm-system
```

### For Backend Blue/Green (`kcm-backend-api`)
```bash
# Undo Blue/Green deployment, switching active traffic back to previous active version
kubectl argo rollouts undo kcm-backend-api -n kcm-system
```

## Step 2: Verify Traffic and Pod Health
```bash
# Check Rollout Status
kubectl argo rollouts get rollout kcm-frontend -n kcm-system
kubectl argo rollouts get rollout kcm-backend-api -n kcm-system

# Check Service Routing
kubectl get svc -n kcm-system
```

## Step 3: Pause Argo CD Sync
To prevent Argo CD from auto-syncing back to the failed Git commit:
```bash
argocd app set kcm-rollouts-app --sync-policy manual
```
