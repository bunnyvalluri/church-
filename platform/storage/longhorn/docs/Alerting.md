# Alerting Policies & Incident Routing

## Alert Matrix

| Alert Name | Condition | Severity | Notification Channel |
|---|---|---|---|
| `LonghornDiskFull` | Disk Usage > 85% for 5m | Critical | Slack (#infra-storage-alerts) |
| `LonghornStorageExhaustion` | Disk Usage > 95% for 2m | Page | PagerDuty / On-Call SRE |
| `LonghornReplicaDegraded` | Volume Robustness == Degraded | Warning | Slack (#infra-storage-alerts) |
| `LonghornVolumeFaulted` | Volume Robustness == Faulted | Critical | PagerDuty / On-Call SRE |
| `LonghornNodeOffline` | Longhorn Node Ready == 0 | Critical | PagerDuty / On-Call SRE |
| `LonghornBackupFailed` | S3 Backup Task Failed | Warning | Email / Slack |
| `LonghornSnapshotFailed` | Snapshot Creation Failed | Warning | Slack |
| `LonghornHighVolumeLatency` | Latency > 100ms for 10m | Warning | Slack |
