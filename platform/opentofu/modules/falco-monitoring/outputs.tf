# =============================================================================
# Falco Monitoring Module — Outputs
# =============================================================================

output "dashboard_configmap_names" {
  description = "Names of all Grafana dashboard ConfigMaps created"
  value = [
    kubernetes_config_map.grafana_dashboard_security_overview.metadata[0].name,
    kubernetes_config_map.grafana_dashboard_falco_events.metadata[0].name,
    kubernetes_config_map.grafana_dashboard_container_threats.metadata[0].name,
    kubernetes_config_map.grafana_dashboard_pod_security.metadata[0].name,
    kubernetes_config_map.grafana_dashboard_threat_timeline.metadata[0].name,
  ]
}

output "servicemonitor_name" {
  description = "Name of the Falcosidekick ServiceMonitor"
  value       = kubernetes_manifest.falcosidekick_servicemonitor.manifest.metadata.name
}
