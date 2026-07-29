variable "namespace" {
  type        = string
  default     = "trivy-system"
  description = "Target Kubernetes namespace for Trivy Operator"
}

variable "chart_version" {
  type        = string
  default     = "0.22.0"
  description = "Helm chart version for trivy-operator"
}

variable "severity_levels" {
  type        = string
  default     = "CRITICAL,HIGH,MEDIUM"
  description = "Comma-separated vulnerability severity levels to detect"
}

variable "replica_count" {
  type        = number
  default     = 2
  description = "Number of Trivy Operator replicas"
}

variable "enable_monitoring" {
  type        = bool
  default     = true
  description = "Enable Prometheus ServiceMonitor creation"
}
