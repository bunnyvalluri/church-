variable "kubeconfig_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Path to the kubeconfig file"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for backup target bucket"
}

variable "namespace" {
  type        = string
  default     = "longhorn-system"
  description = "Kubernetes namespace for Longhorn deployment"
}

variable "longhorn_chart_version" {
  type        = string
  default     = "1.6.2"
  description = "Longhorn Helm chart version"
}

variable "replica_count" {
  type        = number
  default     = 3
  description = "Default volume replica count"
}

variable "backup_target_bucket" {
  type        = string
  default     = "kcm-church-longhorn-backups"
  description = "S3 bucket for Longhorn volume backups"
}
