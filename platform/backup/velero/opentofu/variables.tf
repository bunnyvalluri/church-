variable "aws_region" {
  type        = string
  description = "AWS Region for Velero S3 Backup storage"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment (production, staging, dev)"
  default     = "production"
}

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket for Velero backups"
  default     = "kcm-velero-backups"
}

variable "object_lock_retention_days" {
  type        = number
  description = "Number of days to enforce S3 Object Lock compliance immutability"
  default     = 30
}

variable "backup_expiration_days" {
  type        = number
  description = "Number of days after which backups are expired from S3"
  default     = 365
}

variable "velero_access_key_id" {
  type        = string
  description = "AWS Access Key ID for Velero Service Account"
  sensitive   = true
}

variable "velero_secret_access_key" {
  type        = string
  description = "AWS Secret Access Key for Velero Service Account"
  sensitive   = true
}
