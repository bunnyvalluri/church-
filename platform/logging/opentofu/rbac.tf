# OpenTofu IAM / ServiceAccount Policy for Loki Object Storage Access

resource "aws_iam_policy" "loki_s3_policy" {
  name        = "kcm-${var.environment}-loki-s3-policy"
  description = "IAM Policy allowing Loki read/write access to S3 log storage"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.loki_storage.arn,
          "${aws_s3_bucket.loki_storage.arn}/*"
        ]
      }
    ]
  })
}
