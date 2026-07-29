# Standardized Chart Structure Guide

## 1. Directory Blueprint
Every Helm chart in `platform/helm/charts/<chart_name>/` follows this uniform structure:

```
<chart_name>/
├── Chart.yaml                  # Chart metadata & subchart dependencies
├── values.yaml                 # Base defaults with full inline comments
├── values-production.yaml      # Production overrides (HA, multi-replica, PDB)
├── values-staging.yaml         # Staging overrides
├── values-development.yaml     # Development low-footprint overrides
├── templates/
│   ├── _helpers.tpl            # Standardized template labels & naming macros
│   ├── deployment.yaml         # Workload Deployment spec (or StatefulSet/DaemonSet)
│   ├── service.yaml            # ClusterIP/LoadBalancer Service definition
│   ├── ingress.yaml            # Ingress or Gateway HTTPRoute manifest
│   ├── hpa.yaml                # HorizontalPodAutoscaler spec
│   ├── configmap.yaml          # Application ConfigMap
│   ├── secret.yaml             # Kubernetes Secret manifest
│   ├── serviceaccount.yaml     # Least-privilege ServiceAccount
│   ├── networkpolicy.yaml      # NetworkPolicy ingress/egress rules
│   ├── poddisruptionbudget.yaml# PodDisruptionBudget spec
│   └── servicemonitor.yaml     # Prometheus ServiceMonitor CRD
├── NOTES.txt                   # Helm release post-install message
└── README.md                   # Detailed chart documentation
```
