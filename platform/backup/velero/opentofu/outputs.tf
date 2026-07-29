output "s3_bucket_name" {
  value       = aws_s3_bucket.velero_backups.id
  description = "Name of the created S3 bucket for Velero backups"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.velero_backups.arn
  description = "ARN of the created S3 bucket for Velero backups"
}

output "kms_key_arn" {
  value       = aws_kms_key.velero_backup_key.arn
  description = "ARN of the KMS encryption key"
}

output "iam_policy_arn" {
  value       = aws_iam_policy.velero_s3_policy.arn
  description = "ARN of the Velero IAM access policy"
}
