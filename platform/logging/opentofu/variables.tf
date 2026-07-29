variable "environment" {
  type        = string
  description = "Target deployment environment (production, staging, dev)"
  default     = "production"
}

variable "region" {
  type        = string
  description = "Cloud provider region for S3 / Object Storage"
  default     = "us-east-1"
}

variable "s3_bucket_name" {
  type        = string
  description = "S3 bucket name for Loki chunk and index storage"
  default     = "kcm-loki-chunks-storage"
}

variable "retention_days" {
  type        = number
  description = "Default object storage lifecycle retention in days"
  default     = 30
}

variable "security_retention_days" {
  type        = number
  description = "Security & audit log object storage retention in days"
  default     = 90
}
