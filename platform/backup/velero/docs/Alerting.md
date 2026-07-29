# Alerting Rules & Escalation Matrix

## Prometheus Alert Rules Summary

| Alert Name | Severity | Condition | Description |
| :--- | :--- | :--- | :--- |
| `VeleroBackupFailed` | **Critical** | `velero_backup_failure_total > 0` | Backup execution failed to complete. |
| `VeleroRestoreFailed` | **Critical** | `velero_restore_failed_total > 0` | Disaster recovery restore procedure failed. |
| `VeleroPartialBackup` | **Warning** | `velero_backup_partial_failure_total > 0` | Backup completed with missing resources. |
| `VeleroNodeAgentDown` | **Critical** | DaemonSet ready pods < desired | Node Agent daemonset pod crashed or evicted. |
| `VeleroBackupStorageLocationUnavailable` | **Critical** | BSL status != Available | S3 storage backend is unreachable. |
| `VeleroScheduleMissingExecution` | **Warning** | Last success > 25 hours | Backup schedule failed to trigger. |
