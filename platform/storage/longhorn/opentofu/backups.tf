resource "aws_s3_bucket" "longhorn_backup_target" {
  bucket        = var.backup_target_bucket
  force_destroy = false

  tags = {
    Name        = "KCM Longhorn Backup Target"
    Environment = "production"
    ManagedBy   = "OpenTofu"
  }
}

resource "aws_s3_bucket_versioning" "longhorn_backup_target_versioning" {
  bucket = aws_s3_bucket.longhorn_backup_target.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "longhorn_backup_target_encryption" {
  bucket = aws_s3_bucket.longhorn_backup_target.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
