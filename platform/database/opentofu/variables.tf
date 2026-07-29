variable "environment" {
  type        = string
  default     = "production"
  description = "Target deployment environment"
}

variable "namespace" {
  type        = string
  default     = "kcm-database"
  description = "Kubernetes namespace for PostgreSQL workload"
}

variable "cluster_instances" {
  type        = number
  default     = 3
  description = "Number of PostgreSQL cluster nodes (Primary + Standby Replicas)"
}

variable "storage_size" {
  type        = string
  default     = "50Gi"
  description = "Disk size allocation for database data PVC"
}

variable "s3_backup_bucket" {
  type        = string
  default     = "kcm-database-backups-prod"
  description = "S3 bucket path for Barman WAL and backup storage"
}
