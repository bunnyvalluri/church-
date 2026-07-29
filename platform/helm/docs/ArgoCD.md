# Argo CD ApplicationSet & Helm Sync Guide

## 1. Root ApplicationSet Architecture
The platform root ApplicationSet (`platform/helm/charts/argocd/templates/applicationset.yaml`) dynamically provisions and manages all 15 microservice applications across target namespaces.

```yaml
spec:
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```
