# =============================================================================
# OpenTofu Security Root Module — Kingdom of Christ Ministries
# Calls the falco and falco-monitoring modules
# =============================================================================

# ---------------------------------------------------------------------------
# Falco Runtime Security Engine
# ---------------------------------------------------------------------------
module "falco" {
  source = "./modules/falco"

  falco_namespace                = "falco"
  falco_chart_version            = "4.3.0"
  falcosidekick_chart_version    = "0.7.18"
  falco_driver_kind              = var.falco_driver_kind
  loki_endpoint                  = var.loki_endpoint
  alertmanager_endpoint          = var.alertmanager_endpoint
  otel_endpoint                  = var.otel_endpoint
  enable_high_availability       = var.falco_ha_enabled
  falco_resources_cpu_request    = "200m"
  falco_resources_memory_request = "512Mi"
  falco_resources_cpu_limit      = "2000m"
  falco_resources_memory_limit   = "2Gi"
  cluster_name                   = var.cluster_name
  environment                    = var.environment

  tags = {
    "managed-by"  = "opentofu"
    "cluster"     = var.cluster_name
    "environment" = var.environment
    "team"        = "security"
  }
}

# ---------------------------------------------------------------------------
# Falco Monitoring (Dashboards, ServiceMonitor, PrometheusRule)
# ---------------------------------------------------------------------------
module "falco_monitoring" {
  source = "./modules/falco-monitoring"

  monitoring_namespace     = var.monitoring_namespace
  prometheus_release_label = "kube-prometheus-stack"

  depends_on = [module.falco]
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "falco_namespace" {
  description = "Falco deployment namespace"
  value       = module.falco.falco_namespace
}

output "falco_chart_version" {
  description = "Deployed Falco chart version"
  value       = module.falco.falco_helm_chart_version
}

output "falco_app_version" {
  description = "Deployed Falco application version"
  value       = module.falco.falco_helm_app_version
}

output "falcosidekick_metrics_endpoint" {
  description = "Falcosidekick Prometheus metrics URL"
  value       = module.falco.falcosidekick_metrics_endpoint
}

output "grafana_dashboard_configmaps" {
  description = "Grafana security dashboard ConfigMap names"
  value       = module.falco_monitoring.dashboard_configmap_names
}
