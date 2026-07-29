# OpenTofu S3 Bucket & Storage Infrastructure for Grafana Loki

resource "aws_s3_bucket" "loki_storage" {
  bucket        = var.s3_bucket_name
  force_destroy = false

  tags = {
    Name        = var.s3_bucket_name
    Environment = var.environment
    Service     = "logging-loki"
    ManagedBy   = "OpenTofu"
  }
}

resource "aws_s3_bucket_versioning" "loki_versioning" {
  bucket = aws_s3_bucket.loki_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "loki_encryption" {
  bucket = aws_s3_bucket.loki_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "loki_lifecycle" {
  bucket = aws_s3_bucket.loki_storage.id

  rule {
    id     = "loki-chunks-expiration"
    status = "Enabled"

    filter {
      prefix = "chunks/"
    }

    expiration {
      days = var.retention_days
    }
  }

  rule {
    id     = "security-audit-expiration"
    status = "Enabled"

    filter {
      prefix = "security/"
    }

    expiration {
      days = var.security_retention_days
    }
  }
}
