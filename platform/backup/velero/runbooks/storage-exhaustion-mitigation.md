# Runbook: S3 Storage Exhaustion & Retention Cleanup Mitigation

## Overview
Alert `VeleroStorageExhaustion` or high S3 storage usage indicates that backup storage threshold limits are being exceeded.

---

## 1. Storage Inspection

```bash
# Check all backups and their expiration dates
velero backup get

# Inspect storage capacity in S3 bucket
aws s3 ls s3://kcm-velero-backups/kcm-k8s-cluster/backups/ --recursive --human-readable --summarize
```

---

## 2. Immediate Capacity Remediation

### Delete Expired or Unneeded Manual Backups

```bash
# Delete specific manual or ad-hoc backup
velero backup delete <BACKUP_NAME> --confirm
```

### Force Expiration Audit

If S3 Object Lock lifecycle policies are enabled, verify compliance retention settings in OpenTofu `main.tf`:
```hcl
variable "backup_expiration_days" {
  default = 365
}
```

---

## 3. Storage Optimization Recommendations

1. Exclude high-churn temporary namespaces or ephemeral caches from daily backups (`excludedNamespaces` in `schedule-daily-cluster.yaml`).
2. Verify that S3 Lifecycle transitions move backups older than 90 days to `GLACIER_IR` (Glacier Instant Retrieval).
