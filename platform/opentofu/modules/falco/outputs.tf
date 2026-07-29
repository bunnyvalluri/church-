# =============================================================================
# Falco OpenTofu Module — Outputs
# =============================================================================

output "falco_namespace" {
  description = "Kubernetes namespace where Falco is deployed"
  value       = kubernetes_namespace.falco.metadata[0].name
}

output "falco_service_account" {
  description = "Name of the Falco ServiceAccount"
  value       = kubernetes_service_account.falco.metadata[0].name
}

output "falco_cluster_role" {
  description = "Name of the Falco ClusterRole"
  value       = kubernetes_cluster_role.falco.metadata[0].name
}

output "falco_helm_release_name" {
  description = "Name of the Falco Helm release"
  value       = helm_release.falco.name
}

output "falco_helm_chart_version" {
  description = "Deployed Falco Helm chart version"
  value       = helm_release.falco.version
}

output "falco_helm_app_version" {
  description = "Deployed Falco application version"
  value       = helm_release.falco.metadata[0].app_version
}

output "falcosidekick_helm_release_name" {
  description = "Name of the Falcosidekick Helm release"
  value       = helm_release.falcosidekick.name
}

output "falcosidekick_metrics_endpoint" {
  description = "Falcosidekick Prometheus metrics endpoint"
  value       = "http://falcosidekick.${kubernetes_namespace.falco.metadata[0].name}.svc.cluster.local:2802/metrics"
}

output "falcosidekick_webhook_endpoint" {
  description = "Falcosidekick webhook endpoint for Falco events"
  value       = "http://falcosidekick.${kubernetes_namespace.falco.metadata[0].name}.svc.cluster.local:2801"
}
