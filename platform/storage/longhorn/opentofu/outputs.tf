output "longhorn_namespace" {
  value       = kubernetes_namespace.longhorn_system.metadata[0].name
  description = "The namespace where Longhorn is deployed"
}

output "helm_release_status" {
  value       = helm_release.longhorn.status
  description = "The status of the Longhorn Helm release"
}

output "backup_bucket_arn" {
  value       = aws_s3_bucket.longhorn_backup_target.arn
  description = "ARN of the S3 backup target bucket"
}
