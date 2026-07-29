# Backup Retention & Automatic Cleanup Policy

## Lifecycle Management
Velero automatically manages backup lifecycle expirations based on the `ttl` field in the Schedule CRD. When a backup's TTL expires, Velero issues deletion requests to both the Kubernetes API and the backing S3 object store.

## S3 Glacier Archival Transition
- **0–90 Days**: Backups reside in S3 Standard with AWS KMS Server-Side Encryption.
- **91–365 Days**: Backups transition via S3 Lifecycle rule to `GLACIER_IR` (Glacier Instant Retrieval).
- **>365 Days**: Automatic permanent expiration from S3.
