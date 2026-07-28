# Operational Runbook: Manual Promotion & Override Procedures

## Overview
This runbook guides operators through manually promoting, pausing, or skipping analysis steps in Argo Rollouts.

## Manual Promotion Gate Approval

When a rollout pauses at a manual gate (e.g. Frontend 50% traffic step):

```bash
# View rollout status
kubectl argo rollouts get rollout kcm-frontend -n kcm-system

# Promote rollout to next step
kubectl argo rollouts promote kcm-frontend -n kcm-system
```

## Skipping Analysis Steps (Override)
If a metric analysis fails due to an external monitoring glitch (e.g., Prometheus restart):

```bash
# Promote and skip remaining analysis steps for current release
kubectl argo rollouts promote kcm-frontend -n kcm-system --skip-current-step
```
---
# Operational Runbook: Disaster Recovery & Controller Failover

## Disaster Recovery Overview
In the event of a total cluster recovery or control plane outage:

1. **Backup State**: Argo Rollouts state is stored entirely in CRDs (`rollouts.argoproj.io`, `analysisruns.argoproj.io`).
2. **Re-installation**: Apply `platform/rollouts/install/argo-rollouts-install.yaml`.
3. **Re-sync via Argo CD**:
   ```bash
   argocd app sync argo-rollouts-system
   argocd app sync kcm-rollouts-app
   ```
