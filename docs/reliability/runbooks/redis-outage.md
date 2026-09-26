# Runbook: Redis Outage & Queue Recovery

## 1. Symptoms & Trigger Conditions
- Alert: `RedisConnectionFailure` or `BullMQQueueBacklog`.
- WebSocket dispatches fail or background jobs stall in `waiting` state.

## 2. Immediate Diagnostic Actions
1. **Check Redis Pod Status**:
   ```bash
   kubectl get pods -n kcm-system -l app=kcm-redis
   kubectl logs -n kcm-system -l app=kcm-redis --tail=50
   ```
2. **Ping Redis Server**:
   ```bash
   kubectl exec -it deployment/kcm-backend-api -n kcm-system -- nc -zv kcm-redis 6379
   ```

## 3. Containment & Remediation
- **Scenario A: Memory Pressure / OOM**:
  Restart Redis pod:
  ```bash
  kubectl rollout restart deployment/kcm-redis -n kcm-system
  ```
- **Scenario B: Stalled BullMQ Queues**:
  The application automatically runs with in-memory fallbacks when Redis is offline. Reconnect worker loops:
  ```bash
  kubectl rollout restart deployment/kcm-backend-worker -n kcm-system
  ```

## 4. Verification
- Verify `redis_connected: true` in `STATE.md` and queue metrics on `/metrics`.
