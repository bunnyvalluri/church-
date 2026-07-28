output "grafana_folder_id" {
  value       = grafana_folder.kcm_observability.id
  description = "Grafana Observability folder ID"
}

output "prometheus_datasource_uid" {
  value       = grafana_data_source.prometheus.uid
  description = "Prometheus Datasource UID"
}

output "loki_datasource_uid" {
  value       = grafana_data_source.loki.uid
  description = "Loki Datasource UID"
}
