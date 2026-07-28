# Enterprise Production Troubleshooting Matrix

## Common Production Issues & Resolutions

| Issue Symptom | Root Cause | Diagnosis Steps | Resolution Action |
|---|---|---|---|
| **Argo CD Application `OutOfSync` / `Degraded`** | Helm chart parameter mismatch or K8s API version mismatch | `argocd app get kcm-frontend-prod` | Check diff in Argo CD UI, fix Helm `values.yaml` in GitOps repo. |
| **Pod `CrashLoopBackOff`** | Database connection failure or missing secret key | `kubectl logs deployment/kcm-backend-api -n kcm-prod --previous` | Verify secret keys exist in `kcm-secrets` and DB host is reachable. |
| **Ingress HTTP 502 Bad Gateway** | Target pod readiness probe failing | `kubectl describe pod -l app.kubernetes.io/name=kcm-frontend -n kcm-prod` | Inspect `/health` or `/` endpoint status and fix pod resource bottleneck. |
| **PostgreSQL Connection Pool Exhausted** | High concurrent HTTP requests exceeding DB `max_connections` | Query `pg_stat_activity` in PostgreSQL pod | Scale backend API instances and optimize connection pooling via Prisma. |
| **ImagePullBackOff from GHCR** | Expired or missing `ghcr-secret` Kubernetes image pull secret | `kubectl describe pod <pod-name> -n kcm-prod` | Re-create Docker registry secret: `kubectl create secret docker-registry ghcr-secret ...` |
