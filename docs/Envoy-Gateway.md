# Kubernetes Gateway API & Envoy Gateway

## Purpose
This document provides the technical specification for Envoy Gateway, the modern Kubernetes Gateway API implementation managing edge ingress traffic, TLS termination, path-based routing, JWT authentication policies, rate limiting, and canary traffic splitting across the Kingdom of Christ Ministries platform.

## Scope
Covers manifests in `platform/gateway/` including GatewayClasses, Gateways, HTTPRoutes, SecurityPolicies, and TLS certificates.

## Status
> Status: Implemented

---

## 1. Envoy Gateway Architecture

```mermaid
graph TD
    Client[Internet Clients / Browsers] -->|HTTPS (Port 443)| EnvoyGateway[Envoy Gateway Edge Proxy]
    
    subgraph Gateway Policies
        EnvoyGateway --> TLSPolicy[TLS Termination: Let's Encrypt / cert-manager]
        EnvoyGateway --> RateLimitPolicy[RateLimitPolicy: 100 req/min/IP]
        EnvoyGateway --> SecurityPolicy[SecurityPolicy: JWT Validation on Protected Paths]
    end

    subgraph Kubernetes HTTPRoutes
        EnvoyGateway --> RoutePublic[HTTPRoute: Public & Frontend /*]
        EnvoyGateway --> RouteAPI[HTTPRoute: Companion API /api/socket, /api/ai/*]
        EnvoyGateway --> RouteWebhook[HTTPRoute: Webhooks /api/payments/*, /api/webhooks/*]
        EnvoyGateway --> RouteAdmin[HTTPRoute: Admin Console /admin/*]
    end

    RoutePublic --> FrontendPods[kcm-frontend Service]
    RouteAPI --> BackendPods[kcm-backend Service]
    RouteWebhook --> WebhookPods[kcm-backend Service]
    RouteAdmin --> AdminFrontendPods[kcm-frontend Service]
```

---

## 2. Gateway API Manifests

### 2.1 Gateway Instance (`platform/gateway/gateways/kcm-gateway.yaml`)
```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: kcm-edge-gateway
  namespace: kcm-system
spec:
  gatewayClassName: eg
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "kcmchurch.org"
      tls:
        mode: Terminate
        certificateRefs:
          - kind: Secret
            name: kcm-tls-cert
    - name: http
      protocol: HTTP
      port: 80
      hostname: "kcmchurch.org"
```

### 2.2 HTTPRoute Definitions (`platform/gateway/httproutes/`)
- **`public-route.yaml`**: Routes general traffic, static pages, and Next.js SSR pages to `kcm-frontend:3000`.
- **`webhook-route.yaml`**: Routes external webhooks (`/api/payments/webhook`, `/api/webhooks/httpsms`) directly to backend worker pods with rate limit exemptions.
- **`admin-route.yaml`**: Enforces strict IP allowlists and JWT security headers for `/admin/*` paths.

---

## 3. TLS Termination with cert-manager

- Automatically requests and renews 90-day Let's Encrypt SSL/TLS certificates via ACME HTTP-01 / DNS-01 challenges.
- Injects standard modern cipher suites (`ECDHE-ECDSA-AES128-GCM-SHA256`, `ECDHE-RSA-AES128-GCM-SHA256`) and forces HTTP-to-HTTPS 301 redirects.

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `502 Bad Gateway` from Envoy | Downstream Next.js frontend pod failing readiness probe | Check pod status via `kubectl get pods -n kcm-system` and verify port `3000` is accepting connections. |
| `404 Not Found` on valid API path | Path prefix not matched in HTTPRoute rules | Inspect HTTPRoute status via `kubectl get httproute -n kcm-system -o yaml`. |
| SSL certificate expiration warning | Cert-manager ACME challenge failed | Check cert-manager logs: `kubectl describe certificate kcm-tls-cert -n kcm-system`. |

---

## Security Considerations
- Envoy Gateway strips untrusted internal headers (`X-Forwarded-Client-Cert`, `X-Internal-Role`) before forwarding requests to application pods.

## Related Documentation
- [Kubernetes.md](Kubernetes.md) — Base workload services.
- [ArgoRollouts.md](ArgoRollouts.md) — Canary traffic routing.
- [Security.md](Security.md) — Security headers and rate limiting.
