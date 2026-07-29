# Velero Best Practices & Governance

## Core Engineering Standards

1. **Never Modify Upstream Code**: Always consume official Velero release binaries and charts (`https://github.com/velero-io/velero.git`).
2. **Immutable Backups**: Enforce S3 Object Lock compliance immutability to protect against ransomware and accidental deletion.
3. **Application-Consistent Hooks**: Always use pre/post hooks for stateful databases (CloudNativePG / Redis) to guarantee transaction flushes.
4. **Regular Automated Restore Testing**: Continuously test restores using [restore-validation-job.yaml](file:///c:/K.C.M-Portal/platform/backup/velero/restore/restore-validation-job.yaml).
5. **GitOps Single Source of Truth**: All schedules, storage locations, and policies must strictly be managed via Argo CD.
