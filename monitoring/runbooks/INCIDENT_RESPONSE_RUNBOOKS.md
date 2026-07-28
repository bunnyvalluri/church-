# KCM Platform Incident Response Runbooks & SRE Playbooks

**Target Audience**: On-Call Engineers, Site Reliability Engineers (SRE), Platform Operations  
**Platform**: Kingdom of Christ Ministries (KCM Church)  

---

## 1. High CPU Usage Runbook (`HIGH_CPU_USAGE`)

### Trigger
- Alert: `HighClusterCPUUsage` (CPU > 85% for 5 minutes)

### Diagnostic Steps
1. Open Grafana Dashboard: `Cluster Overview` -> `Node Health`.
2. Run `kubectl top nodes` to identify the hot node.
3. Run `kubectl top pods -A --sort-by=cpu` to identify consuming pod(s).
4. Inspect pod logs via Loki: `{namespace="kcm-prod"} |~ "error|exception|loop"`.

### Mitigation Actions
- **Horizontal Scaling**: Scale deployment replicas: `kubectl scale deployment <name> --replicas=<count> -n kcm-prod`.
- **Pod Eviction**: If single pod is stuck in infinite loop, kill pod: `kubectl delete pod <pod-name> -n kcm-prod`.

---

## 2. Pod CrashLoopBackOff Runbook (`POD_CRASH_LOOP`)

### Trigger
- Alert: `PodCrashLoopBackOff` (Restarts > 2 in 5m)

### Diagnostic Steps
1. Run `kubectl describe pod <pod-name> -n <namespace>`.
2. Inspect `Last State` exit code (e.g., exit code 137 = OOMKilled, exit code 1 = Uncaught exception).
3. Fetch logs for previous failed instance: `kubectl logs <pod-name> -n <namespace> --previous`.

### Mitigation Actions
- **OOMKilled (Exit Code 137)**: Increase memory limit in Helm values or deployment manifest.
- **Config Failure**: Verify Secret / ConfigMap keys exist (`kubectl get configmap`, `kubectl get secret`).

---

## 3. Database Down Runbook (`DATABASE_DOWN`)

### Trigger
- Alert: `DatabaseDown` (`pg_up == 0`)

### Diagnostic Steps
1. Check PostgreSQL pod status: `kubectl get pods -l app.kubernetes.io/name=postgresql -n kcm-prod`.
2. Inspect DB logs: `kubectl logs -l app.kubernetes.io/name=postgresql -n kcm-prod --tail=200`.
3. Check storage volume PVC state: `kubectl get pvc -n kcm-prod`.

### Mitigation Actions
- Restart PostgreSQL service: `kubectl rollout restart statefulset/kcm-postgresql -n kcm-prod`.
- Failover to read replica if primary node disk or volume is corrupted.

---

## 4. Redis Cache Down Runbook (`REDIS_CACHE_DOWN`)

### Trigger
- Alert: `RedisCacheDown` (`redis_up == 0`)

### Diagnostic Steps
1. Verify Redis pod health: `kubectl get pods -l app.kubernetes.io/name=redis -n kcm-prod`.
2. Run Redis ping test: `kubectl exec -it <redis-pod> -n kcm-prod -- redis-cli ping`.

### Mitigation Actions
- If memory limit exhausted, restart Redis pod or increase memory limit in `k8s/redis.yaml`.
- Express backend automatically falls back to in-memory Socket.io handling when Redis is unavailable.

---

## 5. High API Latency Runbook (`HIGH_API_LATENCY`)

### Trigger
- Alert: `HighAPILatency` (P95 Latency > 2s for 5m)

### Diagnostic Steps
1. Check `Express Backend & API Performance` dashboard.
2. Filter by route to identify slow endpoint (e.g., `/api/events`, `/api/media/upload`).
3. Check DB query duration in `PostgreSQL Performance` dashboard to verify if DB lock contention is the bottleneck.

### Mitigation Actions
- Scale backend API deployment: `kubectl scale deployment kcm-backend-api --replicas=5 -n kcm-prod`.
- Clear stale Redis keys if cache hits dropped.
