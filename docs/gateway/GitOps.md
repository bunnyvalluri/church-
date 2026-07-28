# GitOps — KCM Church Gateway Platform

## Argo CD Applications

| Application | Sync Wave | Manages | Auto-Sync |
|---|---|---|---|
| `kcm-gateway-install` | -10 | Envoy Gateway Helm | ✅ |
| `kcm-gateway-bootstrap` | -5 | Namespace + GatewayClass | ✅ |
| `kcm-gateway-tls` | -2 | ClusterIssuers + Certificates | ✅ (no prune) |
| `kcm-gateway-config` | 0 | HTTPRoutes + Policies | ✅ |
| `kcm-gateway-security` | 1 | SecurityPolicies + RBAC | ✅ |
| `kcm-gateway-monitoring` | 2 | ServiceMonitors + Rules | ✅ |

## Sync Ordering (Waves)

Sync waves ensure resources deploy in dependency order:
1. **Wave -10:** Envoy Gateway controller (Helm chart)
2. **Wave -5:** Namespace, GatewayClass bootstrapped
3. **Wave -2:** cert-manager issuers and TLS certificates
4. **Wave 0:** Gateway listeners, HTTPRoutes, traffic policies
5. **Wave 1:** Security policies applied after routes exist
6. **Wave 2:** Monitoring connected to running gateway

## GitOps Workflow

```
Developer pushes to feature branch
    → PR created
    → GitHub Actions: gateway-validate.yml runs
        - YAML lint
        - kubeconform schema check
        - kubectl dry-run on KIND cluster
    → PR approved and merged to main
    → GitHub Actions: gateway-deploy.yml
        - Argo CD sync triggered for changed apps
    → Argo CD: self-heal keeps cluster in sync
    → Any manual kubectl changes → auto-reverted
```

## Argo CD AppProject: kcm-gateway

- **Source repos:** `github.com/bunnyvalluri/church-` + `docker.io/envoyproxy`
- **Destinations:** `envoy-gateway-system`, `kcm-system`, `monitoring`, `cert-manager`
- **Cluster resources:** Namespace, GatewayClass, ClusterIssuer, ClusterRole, ClusterRoleBinding

## Commands

```bash
# Check all gateway apps
argocd app list | grep kcm-gateway

# Manual sync all gateway apps
argocd app sync kcm-gateway-config kcm-gateway-security kcm-gateway-monitoring

# Check sync status
argocd app get kcm-gateway-config

# Force hard refresh (re-read from Git)
argocd app get kcm-gateway-config --hard-refresh
```
