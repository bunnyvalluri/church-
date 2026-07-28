# Argo Rollouts — Gateway API Integration

## Overview

KCM Church uses Argo Rollouts with the **Gateway API traffic routing plugin** to perform progressive delivery (canary and blue/green) via Envoy Gateway instead of NGINX Ingress.

## Rollout Strategies

### Frontend — Canary (10% → 25% → 50% → 100%)

**File:** [`platform/rollouts/frontend-canary.yaml`](../../platform/rollouts/frontend-canary.yaml)

Traffic is shifted by Argo Rollouts updating `HTTPRoute.backendRefs.weight`:

```
Step 1: stable=90%, canary=10%  → 5min wait
Step 2: stable=75%, canary=25%  → 10min wait
Step 3: stable=50%, canary=50%  → manual gate
Step 4: stable=25%, canary=75%  → 5min wait
Step 5: stable=0%, canary=100%  → promotion complete
```

### Backend API — Blue/Green

**File:** [`platform/rollouts/backend-bluegreen.yaml`](../../platform/rollouts/backend-bluegreen.yaml)

- `activeService`: `backend-api-active-service` — receives all production traffic
- `previewService`: `backend-api-preview-service` — receives no production traffic
- Pre-promotion analysis runs against preview environment
- Manual promotion required (`autoPromotionEnabled: false`)

## Gateway API Plugin

The Argo Rollouts Gateway API plugin (`argoproj-labs/gatewayAPI`) must be installed:

```bash
# Add plugin to argo-rollouts configmap
kubectl edit configmap argo-rollouts-config -n argo-rollouts
# Add:
# trafficRouterPlugins:
# - name: argoproj-labs/gatewayAPI
#   location: https://github.com/argoproj-labs/rollouts-plugin-trafficrouter-gateway/releases/download/v0.4.0/gatewayPlugin-linux-amd64
```

## Analysis Templates

Analysis is driven by **Envoy Gateway Prometheus metrics**:

| Template | Metric | Success Condition |
|---|---|---|
| `envoy-gateway-success-rate` | HTTP 2xx / total | ≥ 99% |
| `http-success-rate` | HTTP 2xx / total | ≥ 99% |
| `http-latency` | P95 latency | < 300ms |

## Commands

```bash
# Start canary deploy
kubectl argo rollouts set image kcm-frontend frontend=ghcr.io/bunnyvalluri/kcm-frontend:v2.0 -n kcm-system

# Watch canary progress
kubectl argo rollouts get rollout kcm-frontend -n kcm-system --watch

# Manually promote to next step
kubectl argo rollouts promote kcm-frontend -n kcm-system

# Abort and rollback
kubectl argo rollouts abort kcm-frontend -n kcm-system
kubectl argo rollouts undo kcm-frontend -n kcm-system

# Check HTTPRoute weights in real-time
kubectl get httproute kcm-frontend-route -n kcm-system \
  -o jsonpath='{.spec.rules[0].backendRefs[*].weight}'
```
