variable "kubeconfig_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Path to the Kubernetes config file"
}

variable "namespace" {
  type        = string
  default     = "messaging"
  description = "Kubernetes namespace for NATS deployment"
}

variable "cluster_replicas" {
  type        = number
  default     = 3
  description = "Number of NATS cluster nodes"
}

variable "storage_class" {
  type        = string
  default     = "longhorn-crypto-nvme"
  description = "StorageClass for JetStream persistence PVCs"
}

variable "storage_size" {
  type        = string
  default     = "50Gi"
  description = "Storage size per JetStream replica node"
}
