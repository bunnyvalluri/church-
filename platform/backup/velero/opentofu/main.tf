# OpenTofu Infrastructure-as-Code Module for Velero Backup Storage & Security
# Project: Kingdom of Christ Ministries (KCM Church) Enterprise Kubernetes Platform

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# KMS Key for Server-Side Encryption of Velero S3 Backups
resource "aws_kms_key" "velero_backup_key" {
  description             = "KMS Key for KCM Church Velero S3 Backup Encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
    Project     = "KCM-Church"
    ManagedBy   = "OpenTofu"
    Component   = "Velero-Backup"
  }
}

resource "aws_kms_alias" "velero_backup_key_alias" {
  name          = "alias/kcm-velero-backup-key"
  target_key_id = aws_kms_key.velero_backup_key.key_id
}

# Primary S3 Bucket for Velero Backups
resource "aws_s3_bucket" "velero_backups" {
  bucket        = var.bucket_name
  force_destroy = false

  tags = {
    Environment = var.environment
    Project     = "KCM-Church"
    ManagedBy   = "OpenTofu"
    Component   = "Velero-Storage"
  }
}

# Object Lock Configuration for Immutability / Ransomware Protection
resource "aws_s3_bucket_object_lock_configuration" "velero_object_lock" {
  bucket = aws_s3_bucket.velero_backups.id

  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = var.object_lock_retention_days
    }
  }
}

# Server Side Encryption Configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "velero_encryption" {
  bucket = aws_s3_bucket.velero_backups.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.velero_backup_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "velero_public_block" {
  bucket = aws_s3_bucket.velero_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle Policies for Expiration and Archival to Glacier
resource "aws_s3_bucket_lifecycle_configuration" "velero_lifecycle" {
  bucket = aws_s3_bucket.velero_backups.id

  rule {
    id     = "archive-and-cleanup-rule"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    expiration {
      days = var.backup_expiration_days
    }
  }
}

# IAM Policy for Velero S3 Access
resource "aws_iam_policy" "velero_s3_policy" {
  name        = "kcm-velero-s3-access-policy"
  description = "Minimal IAM privileges required for Velero to write and restore S3 backups"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeVolumes",
          "ec2:DescribeSnapshots",
          "ec2:CreateTags",
          "ec2:CreateVolume",
          "ec2:CreateSnapshot",
          "ec2:DeleteSnapshot"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:PutObject",
          "s3:AbortMultipartUpload",
          "s3:ListMultipartUploadParts"
        ]
        Resource = "${aws_s3_bucket.velero_backups.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.velero_backups.arn
      }
    ]
  })
}

# Kubernetes Secret for Velero Credentials
resource "kubernetes_secret" "velero_s3_credentials" {
  metadata {
    name      = "velero-s3-credentials"
    namespace = "velero"
  }

  data = {
    cloud = <<EOF
[default]
aws_access_key_id = ${var.velero_access_key_id}
aws_secret_access_key = ${var.velero_secret_access_key}
EOF
  }

  type = "Opaque"
}
