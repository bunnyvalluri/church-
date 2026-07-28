# Troubleshooting — KCM Church Gateway Platform

## Quick Diagnostic Commands

```bash
# Full gateway status
kubectl get gateway,httproute,gatewayclass,securitypolicy,backendtrafficpolicy \
  -n kcm-system

# Check all Envoy Gateway pods
kubectl get pods -n envoy-gateway-system -o wide

# Check Envoy proxy admission
kubectl get pods -n kcm-system -l app=kcm-envoy-proxy

# Gateway conditions
kubectl get gateway kcm-gateway -n kcm-system \
  -o jsonpath='{.status.conditions}' | jq .

# HTTPRoute status
kubectl get httproute -n kcm-system \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[0].type}{"\t"}{.status.conditions[0].status}{"\n"}{end}'
```

---

## Common Issues

### 1. Gateway shows `Programmed=False`
**Cause:** Missing TLS secret or GatewayClass not accepted.
```bash
kubectl get secret kcm-tls-cert -n kcm-system     # Must exist
kubectl get gatewayclass kcm-gateway-class          # Must show Accepted=True
```

### 2. HTTPRoute shows `ResolvedRefs=False`
**Cause:** Backend service not found or wrong port.
```bash
kubectl get svc -n kcm-system | grep frontend      # Service must exist
# Check port matches service spec
kubectl describe httproute kcm-frontend-route -n kcm-system
```

### 3. 401 Unauthorized on protected routes
**Cause:** Missing or invalid Firebase JWT token.
```bash
# Test with a valid token:
TOKEN="your-firebase-id-token"
curl -H "Authorization: Bearer $TOKEN" https://api.kcmchurch.org/api/profile
# Check gateway logs for JWT validation errors:
kubectl logs -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway | grep jwt
```

### 4. 429 Too Many Requests
**Cause:** Rate limit exceeded. Check which tier applies.
```bash
kubectl get backendtrafficpolicy kcm-rate-limit-policy -n kcm-system -o yaml
# Check Redis rate limit service:
kubectl get pods -n envoy-gateway-system | grep ratelimit
```

### 5. WebSocket connections dropping
**Cause:** Timeout too short or missing upgrade headers.
```bash
kubectl get httproute kcm-websocket-route -n kcm-system -o yaml
# Timeout should be 3600s
# Check backend-socket-service exists:
kubectl get svc backend-socket-service -n kcm-system
```

### 6. TLS certificate shows `Ready=False`
**Cause:** ACME challenge failed.
```bash
kubectl describe certificate kcm-tls-cert -n kcm-system
kubectl describe challengeorder -n kcm-system  
kubectl logs -n cert-manager -l app=cert-manager | grep -i error
# Ensure port 80 is accessible from internet for HTTP-01 challenge
```

### 7. Argo Rollouts weights not updating HTTPRoute
**Cause:** Gateway API plugin not installed in Argo Rollouts.
```bash
kubectl get cm argo-rollouts-config -n argo-rollouts -o yaml | grep gateway
# Plugin must be installed:
# https://github.com/argoproj-labs/rollouts-plugin-trafficrouter-gateway
```

### 8. Grafana showing no metrics
**Cause:** ServiceMonitor label selector mismatch.
```bash
kubectl get servicemonitor -n monitoring envoy-gateway-controller -o yaml
# Check labels match prometheus operator's serviceMonitorSelector:
kubectl get prometheus -n monitoring -o yaml | grep serviceMonitorSelector -A5
```

---

## Useful Envoy Admin API Commands

```bash
# Port-forward to Envoy admin interface
kubectl port-forward -n kcm-system \
  $(kubectl get pod -n kcm-system -l app=kcm-envoy-proxy -o name | head -1) \
  19000:19000

# In a new terminal:
# Check cluster status
curl http://localhost:19000/clusters | grep kcm

# Check active connections
curl http://localhost:19000/stats | grep downstream_cx_active

# Check config dump
curl http://localhost:19000/config_dump | jq '.configs[].dynamic_route_configs'

# Check rate limit stats
curl http://localhost:19000/stats | grep ratelimit
```
