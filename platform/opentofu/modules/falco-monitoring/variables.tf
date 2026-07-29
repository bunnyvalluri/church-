# =============================================================================
# Falco Monitoring Module — Variables
# =============================================================================

variable "monitoring_namespace" {
  description = "Kubernetes namespace for monitoring stack (Prometheus, Grafana, Loki)"
  type        = string
  default     = "monitoring"
}

variable "grafana_dashboard_label" {
  description = "Label value to trigger Grafana sidecar dashboard provisioning"
  type        = string
  default     = "1"
}

variable "prometheus_release_label" {
  description = "kube-prometheus-stack release label for ServiceMonitor/PrometheusRule discovery"
  type        = string
  default     = "kube-prometheus-stack"
}

variable "additional_labels" {
  description = "Additional labels to apply to all monitoring resources"
  type        = map(string)
  default     = {}
}
