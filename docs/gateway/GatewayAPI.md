# Gateway API — KCM Church Enterprise Gateway Platform

## Overview

The **Gateway API** is the next-generation Kubernetes networking API, replacing legacy `networking.k8s.io/v1 Ingress`. KCM Church uses Envoy Gateway v1.8.3 as the production Gateway controller, implementing the full Gateway API specification.

## Architecture Diagram

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────┐
│          Cloud Load Balancer (External IP)       │
│          Port 80 (HTTP) + Port 443 (HTTPS)      │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│          Envoy Proxy Pods (Data Plane)          │
│          Namespace: kcm-system                  │
│          HPA: 2–10 replicas                     │
└──────┬──────┬──────┬──────┬──────┬─────────────┘
       │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼
    Frontend  API  WebSocket Admin  Pastor/Member/NGO
    :3000    :3001   :3001   :3000  :3000
```

## Resource Hierarchy

```
GatewayClass (cluster-scoped)
    └── Gateway (kcm-system namespace)
            ├── Listener: http (port 80)
            ├── Listener: https (port 443)
            ├── Listener: https-api
            ├── Listener: https-admin
            ├── Listener: https-pastor
            ├── Listener: https-member
            └── Listener: https-ngo
                    ├── HTTPRoute: kcm-frontend-route
                    ├── HTTPRoute: kcm-backend-api-route
                    ├── HTTPRoute: kcm-websocket-route
                    ├── HTTPRoute: kcm-admin-route
                    ├── HTTPRoute: kcm-pastor-route
                    ├── HTTPRoute: kcm-member-route
                    ├── HTTPRoute: kcm-ngo-route
                    ├── HTTPRoute: kcm-health-route
                    ├── HTTPRoute: kcm-webhook-route
                    └── HTTPRoute: kcm-media-route
```

## Key Resources

| Resource | Kind | Description |
|---|---|---|
| `kcm-gateway-class` | GatewayClass | Cluster-level controller reference |
| `kcm-proxy-config` | EnvoyProxy | Custom proxy configuration |
| `kcm-gateway` | Gateway | All listener definitions |
| `kcm-frontend-route` | HTTPRoute | `kcmchurch.org /` → frontend |
| `kcm-backend-api-route` | HTTPRoute | `api.kcmchurch.org /api/*` → backend |
| `kcm-tls-cert` | Certificate | Multi-domain TLS cert |
| `kcm-rate-limit-policy` | BackendTrafficPolicy | Redis-backed rate limiting |
| `kcm-api-security-policy` | SecurityPolicy | CORS + Firebase JWT |

## File Locations

| Component | Path |
|---|---|
| GatewayClass | `platform/gateway/gatewayclass/` |
| Gateway | `platform/gateway/gateways/` |
| HTTPRoutes | `platform/gateway/httproutes/` |
| TLS / Certs | `platform/gateway/tls/` + `platform/gateway/certificates/` |
| Policies | `platform/gateway/policies/` |
| Security | `platform/gateway/security/` |
| Monitoring | `platform/gateway/monitoring/` |
| Argo CD | `platform/gateway/argocd/` |
| Helm | `platform/helm/kcm-gateway/` |
| OpenTofu | `platform/opentofu/modules/gateway/` |
