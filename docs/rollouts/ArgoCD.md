# Argo CD GitOps Integration (`ArgoCD.md`)

## Health Checks & Resource Customizations
Custom Lua health scripts added to `argocd-cm` allow Argo CD to accurately represent `argoproj.io/Rollout` state:
- `Healthy` / `Completed` ➔ Healthy
- `Paused` ➔ Suspended (Waiting for promotion approval)
- `Progressing` ➔ Progressing
- `Degraded` ➔ Degraded

---
# Operations Playbook (`Operations.md`)

## Daily SRE Operating Tasks
1. **View Rollout Status**: `kubectl argo rollouts get rollout <name> -n kcm-system`
2. **Promote Rollout**: `kubectl argo rollouts promote <name> -n kcm-system`
3. **Pause Rollout**: `kubectl argo rollouts pause <name> -n kcm-system`
4. **Abort / Undo Rollout**: `kubectl argo rollouts abort <name> -n kcm-system` && `kubectl argo rollouts undo <name> -n kcm-system`

---
# Runbooks Index (`Runbooks.md`)

- [Emergency Rollback Runbook](file:///c:/K.C.M-Portal/platform/runbooks/emergency-rollback.md)
- [Manual Promotion & Override Runbook](file:///c:/K.C.M-Portal/platform/runbooks/manual-promotion-override.md)

---
# Troubleshooting Guide (`Troubleshooting.md`)

## Common Issues & Resolutions
1. **Rollout Stuck in Paused State**:
   - Cause: Manual step reached or auto-promotion disabled in Blue/Green.
   - Fix: Execute `kubectl argo rollouts promote <rollout-name> -n kcm-system`.

2. **AnalysisRun Failed**:
   - Cause: Prometheus query returned value outside threshold (e.g. latency > 200ms or HTTP 500 errors).
   - Fix: Check application logs, fix issue in code, re-trigger deployment, or override with `kubectl argo rollouts promote <rollout-name> --skip-current-step`.

3. **Controller High Availability Failover**:
   - Cause: Active controller pod evicted or restarted.
   - Behavior: Secondary controller acquires leader lock via Kubernetes Lease within 15 seconds.
