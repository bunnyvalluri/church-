variable "grafana_url" {
  type        = string
  description = "Official Grafana instance URL"
  default     = "https://grafana.kcmchurch.org"
}

variable "grafana_api_token" {
  type        = string
  description = "Grafana API admin Service Account token"
  sensitive   = true
}

variable "prometheus_url" {
  type        = string
  description = "Prometheus service endpoint"
  default     = "http://prometheus-k8s.monitoring.svc.cluster.local:9090"
}

variable "loki_url" {
  type        = string
  description = "Loki log aggregator endpoint"
  default     = "http://loki.monitoring.svc.cluster.local:3100"
}

variable "slack_webhook_url" {
  type        = string
  description = "Slack webhook URL for critical alerts"
  sensitive   = true
  default     = ""
}
