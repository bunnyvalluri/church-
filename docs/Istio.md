# Istio Service Mesh Architecture & Mutual TLS

## Purpose
This document specifies the optional service mesh architecture, mutual TLS (mTLS) encryption, traffic policies, and distributed tracing integration using Istio for the Kingdom of Christ Ministries platform.

## Scope
Covers Istio Helm packaging (`platform/helm/charts/istio/`), Envoy sidecar injection, VirtualServices, DestinationRules, and PeerAuthentication policies.

## Status
> Status: Implemented (Platform Chart Configured)

---

## 1. Service Mesh Architecture & mTLS

```mermaid
graph TD
    subgraph Service Mesh: kcm-system (Auto-Injection Enabled)
        FrontendPod[kcm-frontend Pod + Envoy Sidecar]
        BackendPod[kcm-backend Pod + Envoy Sidecar]
        DBPod[CloudNativePG Pod + Envoy Sidecar]
        RedisPod[Redis Pod + Envoy Sidecar]
    end

    subgraph Mesh Security & Telemetry
        Istiod[Istio Control Plane: istiod] -->|Automated Certificate Authority / mTLS| FrontendPod
        Istiod --> BackendPod
        Istiod --> DBPod
        Istiod --> RedisPod
    end

    FrontendPod -->|STRICT mTLS (Port 5432)| DBPod
    FrontendPod -->|STRICT mTLS (Port 3001)| BackendPod
    BackendPod -->|STRICT mTLS (Port 6379)| RedisPod

    FrontendPod -.->|Trace Spans| Jaeger[(Jaeger / OpenTelemetry Collector)]
    BackendPod -.->|Trace Spans| Jaeger
```

---

## 2. Mesh Configuration & Policies

### 2.1 Strict mTLS Enforcement (`PeerAuthentication`)
Enforces encrypted, authenticated communication across all mesh pods:
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: kcm-system
spec:
  mtls:
    mode: STRICT
```

### 2.2 Traffic Shaping (`VirtualService` & `DestinationRule`)
Controls connection timeouts, retry limits (3 retries with 2s timeout), and circuit breakers (e.g. maximum 50 concurrent pending requests per backend pod).

---

## 3. Distributed Tracing & Observability

- Istio Envoy sidecars automatically inject W3C Trace Context headers (`traceparent`, `tracestate`) into all outbound requests.
- Spans are streamed to OpenTelemetry / Jaeger on port `4317` (gRPC), enabling end-to-end transaction latency tracing from edge gateway to database query.

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Database connection fails with `SSL handshake failed` | PostgreSQL pod has native SSL enabled while Istio sidecar attempts mTLS wrapping | Configure Istio `DestinationRule` with `tls.mode: DISABLE` for direct PostgreSQL ports, or align client certificates. |
| Pod startup delays due to sidecar synchronization | Application container starts before Envoy sidecar is ready | Configure `holdApplicationUntilProxyStarts: true` in Istio sidecar injector settings. |

---

## Security Considerations
- Istiod acts as a dynamic internal Certificate Authority, rotating pod mTLS certificates every 24 hours.

## Related Documentation
- [Envoy-Gateway.md](Envoy-Gateway.md) — Edge gateway proxy.
- [Observability.md](Observability.md) — Distributed tracing and telemetry.
- [Helm.md](Helm.md) — Istio chart configurations.
