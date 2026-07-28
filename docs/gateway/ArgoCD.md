# Argo CD — KCM Church Gateway Applications

## Application List

```bash
argocd app list | grep kcm-gateway
```

| Name | Project | Source | Destination | Sync |
|---|---|---|---|---|
| `kcm-gateway-install` | kcm-gateway | OCI Helm v1.8.3 | `envoy-gateway-system` | Auto |
| `kcm-gateway-bootstrap` | kcm-gateway | Git: platform/gateway/install | `envoy-gateway-system` | Auto |
| `kcm-gateway-tls` | kcm-gateway | Git: platform/gateway/tls + certificates | `kcm-system` | Auto (no prune) |
| `kcm-gateway-config` | kcm-gateway | Git: gatewayclass + gateways + httproutes + policies | `kcm-system` | Auto |
| `kcm-gateway-security` | kcm-gateway | Git: platform/gateway/security | `kcm-system` | Auto |
| `kcm-gateway-monitoring` | kcm-gateway | Git: platform/gateway/monitoring | `monitoring` | Auto |

## Health Checks

Custom health check for `Gateway` kind:
- `Healthy` — when `Programmed=True`
- `Progressing` — when conditions not yet set
- Standard health for all other resource kinds

## Sync Policies

**Enabled for all apps:**
- `selfHeal: true` — auto-reverts manual kubectl changes
- `retry.limit: 5` — retry failed syncs up to 5 times
- `ServerSideApply: true` — for CRD-heavy resources

**Exception — TLS app:**
- `prune: false` — certificates are NEVER pruned (prevent accidental deletion)

## Key Operations

```bash
# Bootstrap all gateway apps (first time)
argocd app create -f platform/gateway/argocd/project-gateway.yaml
argocd app create -f platform/gateway/argocd/app-gateway-install.yaml
argocd app create -f platform/gateway/argocd/app-gateway-config.yaml

# Check sync status
argocd app sync kcm-gateway-config --dry-run

# Disable auto-sync temporarily (maintenance)
argocd app set kcm-gateway-config --sync-policy none

# Re-enable auto-sync
argocd app set kcm-gateway-config --auto-prune --self-heal

# Check resource health
argocd app resources kcm-gateway-config | grep -v Healthy

# Force rollback to previous version
argocd app rollback kcm-gateway-config 1
```

## Sync Wave Ordering

Resources deploy in this sequence during a fresh install:
```
Wave -10: Envoy Gateway Helm chart
Wave  -5: Namespace + GatewayClass (bootstrap)
Wave  -2: cert-manager ClusterIssuers + TLS Certificate
Wave   0: GatewayClass, Gateway, HTTPRoutes, Policies
Wave   1: SecurityPolicies, NetworkPolicies, RBAC
Wave   2: ServiceMonitors, PrometheusRules, OTel Collector
```
