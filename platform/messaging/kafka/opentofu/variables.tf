variable "namespace" {
  type        = string
  default     = "messaging"
  description = "Kubernetes namespace for Kafka infrastructure"
}

variable "broker_count" {
  type        = number
  default     = 3
  description = "Number of Kafka broker replicas in KRaft mode"
}

variable "storage_size" {
  type        = string
  default     = "100Gi"
  description = "Storage volume size per Kafka broker"
}

variable "storage_class_name" {
  type        = string
  default     = "longhorn"
  description = "Longhorn persistent storage class for Kafka PVs"
}
