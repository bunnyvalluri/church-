# Traffic Management — KCM Church Gateway

## Policies Overview

| Policy | Kind | Applies To | Purpose |
|---|---|---|---|
| `kcm-rate-limit-policy` | BackendTrafficPolicy | API HTTPRoute | Redis rate limiting |
| `kcm-frontend-rate-limit-policy` | BackendTrafficPolicy | Frontend HTTPRoute | Frontend rate limiting |
| `kcm-circuit-breaker-policy` | BackendTrafficPolicy | API HTTPRoute | Connection limits + health checks |
| `kcm-timeout-policy` | BackendTrafficPolicy | API HTTPRoute | Timeout + TCP keepalive |
| `kcm-frontend-lb-policy` | BackendLBPolicy | Frontend service | Cookie session persistence |
| `kcm-backend-api-lb-policy` | BackendLBPolicy | API service | Cookie session persistence |
| `kcm-traffic-mirror` | HTTPRoute | API routes | Shadow traffic to canary |

## Timeout Configuration

| Route | Request Timeout | Backend Timeout |
|---|---|---|
| Frontend | 30s | 25s |
| API | 60s | 55s |
| WebSocket | 3600s | 3600s |
| Webhooks | 60s | 55s |
| Media Upload | 300s | 295s |
| Health Check | 5s | — |

## Retry Policy

API routes retry on:
- `Error5xx` — 5xx responses
- `GatewayError` — 502, 503, 504
- `Reset` — connection reset
- Up to **3 retries**, 5s per-retry timeout

## Circuit Breaking (API)

```yaml
maxConnections: 1024
maxPendingRequests: 1024
maxParallelRequests: 1024
maxParallelRetries: 3
```

**Active Health Check:** `GET /health` every 10s
- Unhealthy after 3 failures
- Healthy after 2 successes

## Traffic Mirroring

Controlled via `platform/gateway/policies/traffic-mirror.yaml`.
- **Default:** Disabled (`traffic-mirror.kcm/enabled: "false"`)
- **When enabled:** 10% of API traffic mirrored to canary (shadow — no user impact)
- Enable during pre-production canary testing only

## Session Persistence

Cookie-based session stickiness:
- **Frontend:** 1-hour session cookie
- **API:** 24-hour persistent cookie

## Weighted Routing (Canary)

Argo Rollouts manages weights in `HTTPRoute.backendRefs` during deployments:

```yaml
backendRefs:
  - name: frontend-stable-service
    weight: 90   # Argo Rollouts manages these values
  - name: frontend-canary-service
    weight: 10
```
