# Networking — KCM Church Gateway Platform

## Traffic Flow

```
User Browser
    │
    ▼ DNS lookup: kcmchurch.org → [Gateway LB IP]
    │
    ▼ TCP SYN to port 443
    │
    ▼ TLS Handshake (TLS 1.2+ / ECDHE)
    │  cert: kcm-tls-cert (Let's Encrypt)
    │
    ▼ HTTP/2 request
    │
    ▼ Envoy Proxy (Data Plane)
    │  ├─ ClientTrafficPolicy: header sanitization, connection limits
    │  ├─ SecurityPolicy: CORS check, JWT validation
    │  ├─ BackendTrafficPolicy: rate limiting (Redis), circuit breaking
    │  └─ HTTPRoute matching: hostname + path → backend service
    │
    ▼ Backend Service (ClusterIP)
    │
    ▼ Application Pod (Node.js / Next.js)
```

## DNS Configuration

| Record | Type | Value |
|---|---|---|
| `kcmchurch.org` | A | Gateway LB IP |
| `www.kcmchurch.org` | A | Gateway LB IP |
| `api.kcmchurch.org` | A | Gateway LB IP |
| `admin.kcmchurch.org` | A | Gateway LB IP |
| `pastor.kcmchurch.org` | A | Gateway LB IP |
| `member.kcmchurch.org` | A | Gateway LB IP |
| `ngo.kcmchurch.org` | A | Gateway LB IP |

All domains point to the **same Gateway load balancer IP** — hostname-based routing differentiates traffic.

## Network Policies

### Allowed Traffic Flows

```
Internet → Envoy Proxy (port 80, 443)       ✅
Envoy Proxy → App Pods (port 3000, 3001)    ✅
App Pods → PostgreSQL (port 5432)           ✅
App Pods → Redis (port 6379)                ✅
Prometheus → Envoy (port 19001)             ✅
Envoy → OTel Collector (port 4318)          ✅
Envoy Gateway → Kubernetes API (443/6443)   ✅

Direct Internet → App Pods                  ❌ (blocked)
App Pods → Internet (except HTTPS:443)      ❌ (blocked)
Cross-namespace pods (no ReferenceGrant)    ❌ (blocked)
```

## Ports Reference

| Service | Port | Protocol | Exposed |
|---|---|---|---|
| Envoy Proxy | 80 | HTTP | External (redirect only) |
| Envoy Proxy | 443 | HTTPS | External |
| Envoy Admin | 19000 | HTTP | Internal only |
| Envoy Metrics | 19001 | HTTP | Internal (Prometheus) |
| Frontend (Next.js) | 3000 | HTTP | Internal only |
| Backend API | 3001 | HTTP | Internal only |
| WebSocket | 3001 | WS | Internal only |
| OTel Collector | 4317/4318 | gRPC/HTTP | Internal only |
| Prometheus | 9090 | HTTP | Internal only |
