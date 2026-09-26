# Runbook: Deployment Failure & Automated Rollback

## 1. Symptoms & Trigger Conditions
- Alert: `DeploymentHealthCheckFailed` or `ArgoRolloutDegraded`.
- New deployment pods fail `startupProbe` or crash on boot.

## 2. Immediate Diagnostic Actions
1. **Check Deployment / Rollout Status**:
   ```bash
   kubectl rollout status deployment/kcm-frontend -n kcm-system
   kubectl get pods -n kcm-system -l app=kcm-frontend
   ```
2. **Inspect Crashing Container Logs**:
   ```bash
   kubectl logs -n kcm-system -l app=kcm-frontend --previous --tail=100
   ```

## 3. Containment & Remediation
- **Execute Instant Rollback**:
  ```bash
  kubectl rollout undo deployment/kcm-frontend -n kcm-system
  ```
- **Freeze Production Pipeline**:
  Halt GitHub Actions auto-deploy until root cause is identified and patched in a staging canary build.

## 4. Verification
- Verify old healthy pods take 100% of traffic and error rates normalize.
