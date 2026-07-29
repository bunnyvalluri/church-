# Velero Security Architecture & Hardening

## Defense-in-Depth Measures

1. **Least Privilege RBAC**:
   - `velero-server` service account is restricted to the `velero` namespace with cluster role permissions scoped exclusively to resource backup/restore APIs.

2. **S3 Storage Security**:
   - Server-side encryption using AWS KMS Customer Managed Keys (`aws:kms`).
   - Public access blocks enabled across all S3 buckets.
   - S3 Object Lock in `COMPLIANCE` mode prevents ransomware modification or unauthorized deletion.

3. **Secret Protection**:
   - AWS credentials stored in Kubernetes Opaque secret `velero-s3-credentials`.
   - Secret excluded from plain-text logging and exported backup manifests.
