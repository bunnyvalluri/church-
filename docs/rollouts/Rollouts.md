# Argo Rollouts CRD Reference & Strategy Guide

## Overview
Argo Rollouts replaces the standard Kubernetes `Deployment` object with a custom `Rollout` resource (`argoproj.io/v1alpha1`).

## Core Custom Resource Definitions (CRDs)
1. **Rollout**: Manages pod creation, scaling, traffic routing, and rollout progression.
2. **AnalysisTemplate**: Defines Prometheus, Webhook, or HTTP metric checks used to validate rollout health.
3. **ClusterAnalysisTemplate**: Cluster-scoped metric checks reusable across all namespaces.
4. **AnalysisRun**: An instantiation of an AnalysisTemplate executed during a rollout.
5. **Experiment**: Runs ephemeral pods for experimental testing alongside existing revisions.

---
# Blue/Green Deployment Strategy (`BlueGreen.md`)

## Overview
The Blue/Green strategy is deployed for **`kcm-backend-api`** (Express Node.js API). It runs two complete replica sets:
- **Active Service (`backend-api-active-service`)**: Serves live user API requests.
- **Preview Service (`backend-api-preview-service`)**: Hosts the new release candidate for validation.

## Key Properties
- `autoPromotionEnabled: false`: Requires automated pre-promotion analysis or manual approval before traffic shift.
- `scaleDownDelaySeconds: 30`: Keeps old version active for 30 seconds after promotion to drain ongoing requests gracefully.

---
# Canary Deployment Strategy (`Canary.md`)

## Overview
The Canary strategy is deployed for **`kcm-frontend`** (Next.js App). It gradually increases traffic weight to the new version:
1. **10% Traffic**: Pause 5m (Prometheus metric analysis running).
2. **25% Traffic**: Pause 10m (Prometheus metric analysis running).
3. **50% Traffic**: Manual Approval Gate.
4. **75% Traffic**: Pause 5m.
5. **100% Traffic**: Fully Promoted.

---
# Analysis Templates Guide (`AnalysisTemplates.md`)

## Defined Analysis Metrics
- **HTTP Success Rate**: Verifies 2xx/3xx/4xx requests > 99.5%.
- **HTTP Latency**: Verifies P95 response duration < 200ms.
- **HTTP Error Rate**: Fails if 5xx errors exceed 0.5%.
- **Pod Health**: Fails if pod restarts > 0 or CPU utilization > 80%.
- **DB & Redis Connectivity**: Verifies PostgreSQL pool state and Redis ping response.

---
# Traffic Routing Guide (`TrafficRouting.md`)

## Traffic Splitting Mechanisms
- **NGINX Ingress Controller**: Uses NGINX canary annotations (`nginx.ingress.kubernetes.io/canary-weight`) managed dynamically by the Argo Rollouts controller.
- **Gateway API (HTTPRoute)**: Future-ready `HTTPRoute` rules specifying weighted `backendRefs`.
