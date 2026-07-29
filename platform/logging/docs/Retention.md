# Log Retention & Lifecycle Policy

## Retention Tiering
Log retention is strictly controlled via stream selectors in Loki limits configuration and OpenTofu S3 lifecycle policies:

- **General Application & Cluster Logs**: 30 Days (`30d`). Automatically compacted and deleted by Loki Compactor.
- **Security & Audit Logs**: 90 Days (`90d`). Streams matching `{namespace="security"}`, `{app="falco"}`, or `{category="AUDIT"}`.
- **Archive Strategy**: Cold data moved from S3 Standard to S3 Glacier Instant Retrieval after 30 days.
