# Architecture — KCM Church Enterprise Gateway Platform

## Platform Overview

**Version:** Envoy Gateway v1.8.3  
**Standard:** Kubernetes Gateway API v1  
**Pattern:** GitOps (Argo CD) + Infrastructure as Code (OpenTofu) + Progressive Delivery (Argo Rollouts)

## Component Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         CONTROL PLANE                             │
│                                                                   │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Envoy Gateway     │  │   cert-manager   │  │  Argo CD    │ │
│  │   Controller        │  │   (TLS auto)     │  │  (GitOps)   │ │
│  │   (HA: 2 replicas)  │  │                  │  │             │ │
│  └─────────────────────┘  └──────────────────┘  └─────────────┘ │
│             │                                                     │
└─────────────┼─────────────────────────────────────────────────────┘
              │ Programs
┌─────────────▼─────────────────────────────────────────────────────┐
│                          DATA PLANE                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           Envoy Proxy Pods (kcm-system)                    │  │
│  │           HPA: 2–10 replicas                               │  │
│  │           LoadBalancer Service → External IP               │  │
│  └──────────────────────────────────────────────────────────┬──┘  │
│                                                             │      │
└─────────────────────────────────────────────────────────────┼──────┘
                                                              │ Routes to
┌─────────────────────────────────────────────────────────────▼──────┐
│                        APPLICATION LAYER                           │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │ Frontend │  │ Backend  │  │ WebSocket │  │ Admin/Pastor/    │ │
│  │ Next.js  │  │ Express  │  │ Socket.io │  │ Member/NGO      │ │
│  │ :3000    │  │ :3001    │  │ :3001     │  │ :3000           │ │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘ │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │PostgreSQL│  │  Redis   │  │         Cloudinary               │ │
│  │(Database)│  │ (Cache + │  │         (Media Storage)          │ │
│  │          │  │ RateLimit│  │                                  │ │
│  └──────────┘  └──────────┘  └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Gateway Controller | Envoy Gateway | v1.8.3 |
| Gateway Standard | Kubernetes Gateway API | v1.2.x |
| TLS Automation | cert-manager | v1.15.3 |
| Progressive Delivery | Argo Rollouts | v1.7.x |
| GitOps | Argo CD | v2.12.x |
| IaC | OpenTofu | v1.8.x |
| Charts | Helm | v3.16.x |
| CI/CD | GitHub Actions | — |
| Metrics | Prometheus + Grafana | — |
| Tracing | OpenTelemetry + Tempo | — |
| Logs | Loki | — |
| Auth | Firebase Authentication | — |
| CDN/Media | Cloudinary | — |

## Namespace Layout

| Namespace | Purpose |
|---|---|
| `envoy-gateway-system` | Envoy Gateway controller pods |
| `kcm-system` | KCM app pods + Envoy proxy pods |
| `cert-manager` | cert-manager pods |
| `argocd` | Argo CD server |
| `argo-rollouts` | Argo Rollouts controller |
| `monitoring` | Prometheus, Grafana, Loki, OTel Collector |
