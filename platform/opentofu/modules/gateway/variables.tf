# ==============================================================================
# Kingdom of Christ Ministries — Gateway Module Variables
# ==============================================================================

variable "kubeconfig_path" {
  description = "Path to the kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "envoy_gateway_version" {
  description = "Envoy Gateway Helm chart version"
  type        = string
  default     = "v1.8.3"
}

variable "gateway_namespace" {
  description = "Kubernetes namespace for Envoy Gateway controller"
  type        = string
  default     = "envoy-gateway-system"
}

variable "gateway_replicas" {
  description = "Number of Envoy Gateway controller replicas (min 2 for HA)"
  type        = number
  default     = 2
  validation {
    condition     = var.gateway_replicas >= 1
    error_message = "Gateway replicas must be at least 1."
  }
}

variable "enable_hpa" {
  description = "Enable HorizontalPodAutoscaler for the Envoy proxy deployment"
  type        = bool
  default     = true
}
