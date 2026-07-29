# OpenTofu — Falco Infrastructure as Code
## Kingdom of Christ Ministries

## Modules

### `modules/falco`
Provisions Falco runtime security engine:
- `falco` Kubernetes namespace (with PSA labels)
- ServiceAccount + ClusterRole + ClusterRoleBinding
- NetworkPolicy
- Falco Helm release (official `falcosecurity/falco` chart)
- Falcosidekick Helm release

### `modules/falco-monitoring`
Provisions observability integration:
- Grafana dashboard ConfigMaps (5 dashboards)
- ServiceMonitor for Prometheus scraping Falcosidekick

## Usage

```hcl
# In platform/opentofu/security.tf
module "falco" {
  source = "./modules/falco"

  falco_namespace             = "falco"
  falco_chart_version         = "4.3.0"
  falco_driver_kind           = "modern_ebpf"
  loki_endpoint               = "http://loki.monitoring.svc.cluster.local:3100"
  alertmanager_endpoint       = "http://alertmanager-operated.monitoring.svc.cluster.local:9093"
  enable_high_availability    = true
}

module "falco_monitoring" {
  source             = "./modules/falco-monitoring"
  monitoring_namespace = "monitoring"
  depends_on         = [module.falco]
}
```

## Commands

```bash
cd platform/opentofu

# Initialize providers
tofu init

# Plan security changes
tofu plan -target=module.falco -target=module.falco_monitoring

# Apply
tofu apply -target=module.falco
tofu apply -target=module.falco_monitoring

# Show outputs
tofu output falco_namespace
tofu output falcosidekick_metrics_endpoint
tofu output grafana_dashboard_configmaps

# Validate
tofu validate
tofu fmt -check -recursive
```

## Variables Reference

| Variable | Default | Description |
|---|---|---|
| `falco_namespace` | `falco` | K8s namespace for Falco |
| `falco_chart_version` | `4.3.0` | Official Helm chart version |
| `falco_driver_kind` | `modern_ebpf` | eBPF driver type |
| `loki_endpoint` | `http://loki.monitoring...` | Loki HTTP push endpoint |
| `alertmanager_endpoint` | `http://alertmanager-operated...` | Alertmanager endpoint |
| `enable_high_availability` | `true` | HA mode (2 Falcosidekick replicas) |

## State Management

OpenTofu state for security module is stored alongside the gateway module state.
All resources are idempotent — `tofu apply` can be safely re-run.
