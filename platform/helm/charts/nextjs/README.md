# Next.js Helm Chart - Kingdom of Christ Ministries

## Overview
This Helm chart deploys the production-grade Next.js Frontend for the Kingdom of Christ Ministries (KCM Church) web platform.

## Features
- **Zero-Downtime Deployment**: Configured with RollingUpdates and PodDisruptionBudgets.
- **Auto-Scaling**: HPA configured based on CPU & Memory targets.
- **Gateway & Ingress Integration**: Native support for Envoy Gateway / Ingress controllers with TLS cert-manager.
- **DevSecOps**: Non-root execution, read-only root filesystem, dropped capabilities.
- **Observability**: Built-in Prometheus ServiceMonitor integration.

## Installation
```bash
helm install nextjs platform/helm/charts/nextjs -f platform/helm/charts/nextjs/values-production.yaml --namespace kcm-production
```
