# GitOps — Falco Security Platform
## Kingdom of Christ Ministries

## Overview

All Falco configuration is managed via **GitOps** using ArgoCD.
No manual kubectl commands are needed in production — everything is version-controlled.

## Repository Structure

```
github.com/bunnyvalluri/kcm-church-infra
├── platform/security/falco/        ← Falco config (this repo)
│   ├── helm/                       ← Helm values
│   ├── rules/                      ← Custom Falco rules
│   ├── dashboards/                 ← Grafana dashboards
│   ├── alerts/                     ← Prometheus rules + Alertmanager config
│   ├── kubernetes/                 ← K8s manifests
│   ├── monitoring/                 ← Loki/OTel configs
│   └── runbooks/                   ← Incident response
└── kcm-church-infra/security/falco/
    ├── argocd-project.yaml         ← ArgoCD AppProject: security
    └── argocd-application.yaml     ← 4 ArgoCD Applications
```

## ArgoCD Applications

| App Name | Sync Wave | Source | Target Namespace |
|---|---|---|---|
| `falco-kubernetes` | 0 (first) | `platform/security/falco/kubernetes/` | `falco` |
| `falco` | 1 | Official Helm chart + `helm/values.yaml` | `falco` |
| `falco-rules` | 1 | `platform/security/falco/kubernetes/configmap-rules.yaml` | `falco` |
| `falco-monitoring` | 2 (last) | `platform/security/falco/alerts/`, `dashboards/`, `monitoring/` | `monitoring` |

## GitOps Workflow

### Changing Falco Rules

```bash
# 1. Edit rules file
vim platform/security/falco/rules/kcm-custom-rules.yaml

# 2. CI validates (falco-security-ci.yml runs)

# 3. Merge to main → ArgoCD syncs falco-rules app → Falco hot-reloads
```

### Upgrading Falco

```bash
# 1. Update chart version in ArgoCD Application
vim kcm-church-infra/security/falco/argocd-application.yaml
# Change: targetRevision: "4.3.0" → "4.4.0"

# 2. ArgoCD detects drift → triggers sync → rolling DaemonSet upgrade
```

### Updating Alert Rules

```bash
# 1. Edit PrometheusRule
vim platform/security/falco/alerts/falco-prometheus-rules.yaml

# 2. ArgoCD syncs falco-monitoring app → Prometheus reloads rules
```

## Sync Policy

All Falco ArgoCD Applications use:
- `automated.prune: true` — removes deleted resources
- `automated.selfHeal: true` — reverts manual kubectl changes
- Retry with exponential backoff (5 attempts, 30s start)

## Accessing ArgoCD

```bash
# CLI
argocd app list | grep falco
argocd app sync falco
argocd app get falco --output wide

# Web UI
kubectl port-forward -n argocd svc/argocd-server 8080:80
# Browse: http://localhost:8080
```
