variable "ghcr_username" {
  type        = string
  description = "GitHub Container Registry username"
  default     = "bunnyvalluri"
}

variable "ghcr_pat" {
  type        = string
  description = "GitHub Personal Access Token with read/write package permissions"
  sensitive   = true
}

variable "kubernetes_config_path" {
  type        = string
  description = "Path to kubeconfig file"
  default     = "~/.kube/config"
}
