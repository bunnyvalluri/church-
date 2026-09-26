# Runbook: API Outage & High Error Rate Remediation

## 1. Symptoms & Trigger Conditions
- Alert: `High5xxRate` or `HighHttpLatency` triggered in Prometheus/Grafana.
- HTTP status 500, 502, 503, or 504 on `/api/*` endpoints.

## 2. Immediate Diagnostic Actions
1. **Inspect Edge / Next.js Server Logs**:
   ```bash
   kubectl logs -n kcm-system -l app=kcm-frontend --tail=100 -f
   ```
2. **Check Pod Health & Restarts**:
   ```bash
   kubectl get pods -n kcm-system -l app=kcm-frontend
   ```
3. **Verify Upstream Database Connectivity**:
   ```bash
   curl -I https://kcmchurch.vercel.app/api/health
   ```

## 3. Containment & Remediation
- **Scenario A: Memory Leak / CPU Saturation**:
  Scale frontend deployment temporarily:
  ```bash
  kubectl scale deployment/kcm-frontend -n kcm-system --replicas=5
  ```
- **Scenario B: Broken Release / Bad Deployment**:
  Rollback to the previous stable release:
  ```bash
  kubectl rollout undo deployment/kcm-frontend -n kcm-system
  ```
- **Scenario C: Cascading Database Exhaustion**:
  Enable offline read-fallback mode (`DB_OFFLINE=true`) to serve static content while database pool recovers.

## 4. Verification
- Confirm HTTP 200 on `/api/health/live` and `/api/health/ready`.
- Verify error rate drops below 0.1% in Grafana.
