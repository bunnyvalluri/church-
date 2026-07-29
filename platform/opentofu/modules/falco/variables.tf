# =============================================================================
# Falco OpenTofu Module — Variables
# =============================================================================

variable "falco_namespace" {
  description = "Kubernetes namespace for Falco runtime security"
  type        = string
  default     = "falco"
}

variable "falco_chart_version" {
  description = "Falco Helm chart version (falcosecurity/falco)"
  type        = string
  default     = "4.3.0"   # Latest stable — check https://github.com/falcosecurity/charts/releases
}

variable "falcosidekick_chart_version" {
  description = "Falcosidekick Helm chart version"
  type        = string
  default     = "0.7.18"
}

variable "falco_driver_kind" {
  description = "Falco kernel driver type: modern_ebpf | ebpf | kmod"
  type        = string
  default     = "modern_ebpf"

  validation {
    condition     = contains(["modern_ebpf", "ebpf", "kmod"], var.falco_driver_kind)
    error_message = "falco_driver_kind must be one of: modern_ebpf, ebpf, kmod"
  }
}

variable "loki_endpoint" {
  description = "Loki HTTP endpoint for Falcosidekick event forwarding"
  type        = string
  default     = "http://loki.monitoring.svc.cluster.local:3100"
}

variable "alertmanager_endpoint" {
  description = "Alertmanager endpoint for Falcosidekick alert forwarding"
  type        = string
  default     = "http://alertmanager-operated.monitoring.svc.cluster.local:9093"
}

variable "otel_endpoint" {
  description = "OpenTelemetry OTLP gRPC endpoint for trace forwarding"
  type        = string
  default     = "http://otel-collector.monitoring.svc.cluster.local:4317"
}

variable "enable_high_availability" {
  description = "Enable HA configuration (2+ Falcosidekick replicas, stricter PDB)"
  type        = bool
  default     = true
}

variable "falco_resources_cpu_request" {
  description = "CPU request for Falco DaemonSet pods"
  type        = string
  default     = "200m"
}

variable "falco_resources_memory_request" {
  description = "Memory request for Falco DaemonSet pods"
  type        = string
  default     = "512Mi"
}

variable "falco_resources_cpu_limit" {
  description = "CPU limit for Falco DaemonSet pods"
  type        = string
  default     = "2000m"
}

variable "falco_resources_memory_limit" {
  description = "Memory limit for Falco DaemonSet pods"
  type        = string
  default     = "2Gi"
}

variable "cluster_name" {
  description = "Kubernetes cluster name (used for metric labels)"
  type        = string
  default     = "kcm-prod"
}

variable "environment" {
  description = "Deployment environment (production, staging, dev)"
  type        = string
  default     = "production"
}

variable "tags" {
  description = "Additional tags/labels to apply to all resources"
  type        = map(string)
  default     = {}
}
