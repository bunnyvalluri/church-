resource "grafana_folder" "kcm_observability" {
  title = "KCM Platform Observability"
}

resource "grafana_data_source" "prometheus" {
  type       = "prometheus"
  name       = "Prometheus-OpenTofu"
  url        = var.prometheus_url
  is_default = true

  json_data_encoded = jsonencode({
    httpMethod        = "POST"
    timeInterval      = "15s"
    queryTimeout      = "60s"
    prometheusVersion = "2.50.0"
  })
}

resource "grafana_data_source" "loki" {
  type = "loki"
  name = "Loki-OpenTofu"
  url  = var.loki_url

  json_data_encoded = jsonencode({
    maxLines = 5000
  })
}

resource "grafana_dashboard" "cluster_overview" {
  folder      = grafana_folder.kcm_observability.id
  config_json = file("${path.module}/../dashboards/cluster-overview.json")
}

resource "grafana_dashboard" "app_overview" {
  folder      = grafana_folder.kcm_observability.id
  config_json = file("${path.module}/../dashboards/app-overview.json")
}

resource "grafana_dashboard" "express_backend" {
  folder      = grafana_folder.kcm_observability.id
  config_json = file("${path.module}/../dashboards/express-backend.json")
}

resource "grafana_dashboard" "postgresql_performance" {
  folder      = grafana_folder.kcm_observability.id
  config_json = file("${path.module}/../dashboards/postgresql-performance.json")
}

resource "grafana_dashboard" "redis_performance" {
  folder      = grafana_folder.kcm_observability.id
  config_json = file("${path.module}/../dashboards/redis-performance.json")
}

resource "grafana_dashboard" "argocd_gitops" {
  folder      = grafana_folder.kcm_observability.id
  config_json = file("${path.module}/../dashboards/argocd-gitops.json")
}
