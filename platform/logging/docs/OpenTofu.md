# Infrastructure as Code (OpenTofu) Specification

## Module Resources
The OpenTofu module in `platform/logging/opentofu/` manages cloud storage and IAM security:

1. **`aws_s3_bucket.loki_storage`**: Dedicated S3 object storage for Loki chunks and index files.
2. **`aws_s3_bucket_lifecycle_configuration.loki_lifecycle`**: Enforces 30-day chunk expiration and 90-day security log expiration.
3. **`aws_iam_policy.loki_s3_policy`**: Grants least-privilege S3 read/write permissions to Loki pods.
