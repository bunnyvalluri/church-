# =============================================================================
# OpenTofu Root Module — Variables
# Kingdom of Christ Ministries
# =============================================================================

variable "kubeconfig_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Path to the kubeconfig file."
}

# ---------------------------------------------------------------------------
# Cluster / Environment
# ---------------------------------------------------------------------------
variable "cluster_name" {
  type        = string
  default     = "kcm-prod"
  description = "Kubernetes cluster name (used for metric labels and tagging)."
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment (production, staging, dev)."

  validation {
    condition     = contains(["production", "staging", "dev"], var.environment)
    error_message = "environment must be one of: production, staging, dev"
  }
}

# ---------------------------------------------------------------------------
# Falco — Runtime Security
# ---------------------------------------------------------------------------
variable "falco_driver_kind" {
  type        = string
  default     = "modern_ebpf"
  description = "Falco kernel driver type: modern_ebpf | ebpf | kmod"

  validation {
    condition     = contains(["modern_ebpf", "ebpf", "kmod"], var.falco_driver_kind)
    error_message = "falco_driver_kind must be one of: modern_ebpf, ebpf, kmod"
  }
}

variable "falco_ha_enabled" {
  type        = bool
  default     = true
  description = "Enable Falco high-availability configuration (2+ Falcosidekick replicas)."
}

# ---------------------------------------------------------------------------
# Service Endpoints
# ---------------------------------------------------------------------------
variable "loki_endpoint" {
  type        = string
  default     = "http://loki.monitoring.svc.cluster.local:3100"
  description = "Loki HTTP endpoint for Falcosidekick event forwarding."
}

variable "alertmanager_endpoint" {
  type        = string
  default     = "http://alertmanager-operated.monitoring.svc.cluster.local:9093"
  description = "Alertmanager endpoint for Falcosidekick alert forwarding."
}

variable "otel_endpoint" {
  type        = string
  default     = "http://otel-collector.monitoring.svc.cluster.local:4317"
  description = "OpenTelemetry OTLP gRPC endpoint for trace forwarding."
}

# ---------------------------------------------------------------------------
# Monitoring
# ---------------------------------------------------------------------------
variable "monitoring_namespace" {
  type        = string
  default     = "monitoring"
  description = "Kubernetes namespace where Prometheus/Grafana monitoring stack is deployed."
}

# ---------------------------------------------------------------------------
# Gateway API / Argo Rollouts (legacy — kept for gateway.tf compatibility)
# ---------------------------------------------------------------------------
variable "namespace" {
  type        = string
  default     = "argo-rollouts"
  description = "Target namespace for Argo Rollouts controller."
}

variable "argo_rollouts_version" {
  type        = string
  default     = "2.35.0"
  description = "Argo Rollouts Helm chart version."
}

# ---------------------------------------------------------------------------
# Gateway / Cert-Manager
# ---------------------------------------------------------------------------
variable "cert_manager_version" {
  type        = string
  default     = "v1.14.4"
  description = "cert-manager Helm chart version."
}

variable "letsencrypt_email" {
  type        = string
  default     = "devops@kcm.church"
  description = "Email address for Let's Encrypt certificate issuance notifications."
}

variable "envoy_gateway_version" {
  type        = string
  default     = "1.1.0"
  description = "Envoy Gateway Helm chart version."
}

variable "gateway_namespace" {
  type        = string
  default     = "envoy-gateway-system"
  description = "Kubernetes namespace for Envoy Gateway."
}

variable "gateway_replicas" {
  type        = number
  default     = 2
  description = "Number of Envoy Gateway controller replicas."
}

variable "enable_hpa" {
  type        = bool
  default     = true
  description = "Enable HorizontalPodAutoscaler for Envoy Gateway."
}

