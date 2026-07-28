# Enterprise Kubernetes & Cloud Architecture - KCM Church

## 1. System Overview

Kingdom of Christ Ministries (KCM Church) operates a high-availability, scalable, containerized enterprise web platform built on modern cloud-native principles and GitOps delivery.

```
                               ┌────────────────────────────────────────┐
                               │           Client / End User            │
                               └───────────────────┬────────────────────┘
                                                   │ HTTPS (TLS 1.3)
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │           NGINX Ingress Controller      │
                               └───────────┬────────────────┬───────────┘
                                           │                │
                   ┌───────────────────────┘                └───────────────────────┐
                   │                                                                │
                   ▼                                                                ▼
┌─────────────────────────────────────┐                  ┌─────────────────────────────────────┐
│  Namespace: kcm-prod                │                  │  Namespace: argocd                  │
│                                     │                  │                                     │
│  ┌───────────────────────────────┐  │                  │  ┌───────────────────────────────┐  │
│  │ kcm-frontend (Next.js SSR)    │  │                  │  │ Argo CD HA API Server         │  │
│  │ Replicas: 2 - 10 (HPA v2)     │  │                  │  │ Argo CD Application Controller│  │
│  └───────────────┬───────────────┘  │                  │  │ Argo CD Repo Server           │  │
│                  │ REST/gRPC        │                  │  └───────────────────────────────┘  │
│                  ▼                  │                  └─────────────────────────────────────┘
│  ┌───────────────────────────────┐  │
│  │ kcm-backend-api (Express.js)  │  │                  ┌─────────────────────────────────────┐
│  │ Replicas: 2 - 8 (HPA v2)      │  │                  │  Namespace: monitoring              │
│  └───────┬───────────────┬───────┘  │                  │                                     │
│          │               │          │                  │  ┌───────────────────────────────┐  │
│          ▼               ▼          │                  │  │ Prometheus Operator           │  │
│  ┌──────────────┐ ┌──────────────┐ │                  │  │ Grafana Dashboards            │  │
│  │ PostgreSQL HA│ │ Redis HA     │ │                  │  │ Loki + Promtail               │  │
│  │ StatefulSet  │ │ StatefulSet  │ │                  │  │ Alertmanager                  │  │
│  └──────────────┘ └──────────────┘ │                  │  └───────────────────────────────┘  │
└─────────────────────────────────────┘                  └─────────────────────────────────────┘
```

---

## 2. Technology Stack & Component Specifications

| Tier | Component | Technology | Scaling Strategy |
|---|---|---|---|
| **Frontend** | Next.js App Router | React 18, Tailwind CSS, TypeScript | HPA v2 (CPU 70%, Memory 80%, Request Rate) |
| **Backend API** | Express.js Server | Node.js 20 ESM, Socket.io | HPA v2 (CPU 75%, Memory 80%) |
| **Background Workers** | Worker Node & Cron | Node.js, Prisma ORM | Fixed Replicas with KEDA scaling option |
| **Relational Database**| PostgreSQL | PostgreSQL 16.1 Alpine StatefulSet | PV 20Gi ReadWriteOnce, WAL Archiving |
| **Cache & Sessions** | Redis | Redis 7.2 Alpine StatefulSet | PV 5Gi ReadWriteOnce, AOF persistence |
| **Authentication** | Firebase Auth | Firebase Admin SDK, JWT verification | External SaaS |
| **Media Storage** | Cloudinary | Cloudinary CDN SDK | External SaaS |
| **Orchestration** | Kubernetes | K8s v1.28+ Control Plane | Horizontal & Cluster Autoscaler |
| **GitOps Engine** | Argo CD | Official upstream release (HA Mode) | Multi-replica controller & server |
| **Observability** | Prometheus / Loki | Grafana, Promtail, Alertmanager | StatefulSet & DaemonSet |

---

## 3. Namespace Layout & Segmentation

1. `argocd`: Official Argo CD HA deployment, repo server, and web console.
2. `kcm-prod`: Production workloads (Frontend, Backend API, Worker, Cron, Database, Cache).
3. `kcm-staging`: Staging workloads for pre-release validation.
4. `kcm-dev`: Development integration environment.
5. `monitoring`: Prometheus, Grafana, Loki, Alertmanager, node-exporter, kube-state-metrics.
6. `ingress-nginx`: Ingress controllers handling routing and TLS termination.
7. `cert-manager`: Automated TLS certificate lifecycle management via Let's Encrypt.
