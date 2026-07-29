# Runbook: Velero Backup Failure Triage & Remediation

## Overview
This runbook provides step-by-step diagnostic and resolution procedures for resolving Velero backup failures (`VeleroBackupFailed`, `VeleroPartialBackup`, `VeleroScheduleMissingExecution`).

---

## 1. Initial Alert Assessment

When an alert triggers (`VeleroBackupFailed`):

```bash
# Check recent Velero backup statuses
velero backup get

# Inspect detailed status of the failed backup
velero backup describe <BACKUP_NAME> --details

# Fetch logs for the specific failed backup
velero backup logs <BACKUP_NAME>
```

---

## 2. Common Root Causes & Solutions

### Scenario A: S3 BackupStorageLocation Access Denied or Timeout
- **Symptom**: `error storing backup in object storage: AccessDenied` or `connection refused`.
- **Diagnosis**:
  ```bash
  velero backup-location get
  kubectl describe backupstoragelocation kcm-s3-primary -n velero
  ```
- **Remediation**:
  1. Verify the Kubernetes secret `velero-s3-credentials` in namespace `velero`.
  2. Verify IAM credentials, S3 bucket permissions, and KMS key policy via AWS CLI.
  3. Re-test S3 connection from Velero pod using `aws s3 ls s3://kcm-velero-backups`.

### Scenario B: Database Pre-Backup Hook Timeout
- **Symptom**: `hook execution failed: timeout waiting for command to execute`.
- **Diagnosis**:
  Inspect logs of the CloudNativePG or Redis container.
- **Remediation**:
  1. Increase `pre.hook.backup.velero.io/timeout` in `schedule-hourly-critical.yaml` if database freeze takes >30 seconds.
  2. Ensure PostgreSQL pod is healthy and not locked by deadlocked transactions.

### Scenario C: CSI VolumeSnapshot Driver Failure
- **Symptom**: `failed to snapshot volume: VolumeSnapshotClass not found`.
- **Diagnosis**:
  ```bash
  kubectl get volumesnapshotclasses
  kubectl get volumesnapshots -A
  ```
- **Remediation**:
  Ensure your cloud provider CSI snapshotter (`aws-ebs-csi-driver`) is installed and annotated with `velero.io/csi-deletes-volumesnapshot=true`.
