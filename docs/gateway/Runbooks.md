# Runbooks — KCM Church Gateway Platform

## Runbook: Envoy Gateway Down

**Alert:** `EnvoyGatewayDown`

```bash
# 1. Check pod status
kubectl get pods -n envoy-gateway-system
kubectl describe pod -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway

# 2. Check logs
kubectl logs -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway --tail=100

# 3. Check events
kubectl get events -n envoy-gateway-system --sort-by='.lastTimestamp'

# 4. Restart if CrashLoop
kubectl rollout restart deployment/envoy-gateway -n envoy-gateway-system

# 5. If unrecoverable — emergency rollback to NGINX Ingress
# Revert DNS to NGINX load balancer IP
```

---

## Runbook: High Error Rate (>5%)

**Alert:** `KCMHighErrorRate`

```bash
# 1. Check which cluster/route is erroring
kubectl exec -it -n envoy-gateway-system \
  $(kubectl get pod -n envoy-gateway-system -l app=kcm-envoy-proxy -o name | head -1) \
  -- curl http://localhost:19000/stats | grep upstream_rq_5xx

# 2. Check backend pod health
kubectl get pods -n kcm-system
kubectl logs -n kcm-system -l app=kcm-backend-api --tail=50

# 3. Check Rollout status (may be mid-canary)
kubectl argo rollouts get rollout kcm-backend-api -n kcm-system

# 4. Rollback if canary is active and causing errors
kubectl argo rollouts abort kcm-backend-api -n kcm-system
kubectl argo rollouts undo kcm-backend-api -n kcm-system
```

---

## Runbook: Certificate Expired

**Alert:** `TLSCertificateExpired`

```bash
# 1. Check certificate status
kubectl describe certificate kcm-tls-cert -n kcm-system

# 2. Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager --tail=100

# 3. Force renewal
kubectl delete secret kcm-tls-cert -n kcm-system
# cert-manager will auto-re-issue

# 4. Monitor re-issuance
kubectl get certificate kcm-tls-cert -n kcm-system --watch
```

---

## Runbook: Rate Limiting Triggering Unexpectedly

**Alert:** `KCMRateLimitTriggered`

```bash
# 1. Check rate limit policy
kubectl get backendtrafficpolicy kcm-rate-limit-policy -n kcm-system -o yaml

# 2. Check Redis connection from rate limiter
kubectl logs -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway | grep ratelimit

# 3. Temporarily increase limits if legitimate traffic spike
kubectl edit backendtrafficpolicy kcm-rate-limit-policy -n kcm-system
# Increase requests value

# 4. Check Grafana rate limit panel for offending IPs
```

---

## Runbook: Gateway Not Programmed

```bash
# If 'kubectl get gateway kcm-gateway -n kcm-system' shows Programmed=False:

# 1. Check GatewayClass is accepted
kubectl get gatewayclass kcm-gateway-class

# 2. Check TLS secret exists
kubectl get secret kcm-tls-cert -n kcm-system

# 3. Check for conflicting listeners
kubectl describe gateway kcm-gateway -n kcm-system

# 4. Check Envoy Gateway controller logs
kubectl logs -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway | grep -i error
```

---

## Runbook: Argo Rollouts Canary Stuck

```bash
# Check rollout status
kubectl argo rollouts get rollout kcm-frontend -n kcm-system

# Check if HTTPRoute weights were updated
kubectl get httproute kcm-frontend-route -n kcm-system \
  -o jsonpath='{.spec.rules[0].backendRefs}'

# Force promote (if safe)
kubectl argo rollouts promote kcm-frontend -n kcm-system

# Abort and rollback
kubectl argo rollouts abort kcm-frontend -n kcm-system
```
