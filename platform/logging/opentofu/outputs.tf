output "loki_s3_bucket_arn" {
  description = "ARN of the S3 bucket created for Loki log storage"
  value       = aws_s3_bucket.loki_storage.arn
}

output "loki_s3_bucket_name" {
  description = "Name of the S3 bucket created for Loki log storage"
  value       = aws_s3_bucket.loki_storage.id
}

output "loki_iam_policy_arn" {
  description = "ARN of the IAM policy granting S3 access to Loki"
  value       = aws_iam_policy.loki_s3_policy.arn
}
