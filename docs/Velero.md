# Velero Cluster Disaster Recovery & Backup Architecture

## Purpose
This document provides the technical specification for Velero, the enterprise Kubernetes disaster recovery and backup operator managing scheduled cluster-wide backups, custom resource definitions (CRDs), secrets, and volume snapshot synchronizations across the Kingdom of Christ Ministries infrastructure.

## Scope
Covers manifests in `platform/backup/velero/`, S3 storage locations, backup schedules, restore procedures, and disaster recovery runbooks.

## Status
> Status: Implemented

---

## 1. Velero Backup Architecture

```mermaid
graph TD
    VeleroServer[Velero Controller Pod: velero namespace]
    
    subgraph Scheduled Triggers
        DailySchedule[Schedule: daily-cluster-dr (Nightly 02:00 UTC)]
        HourlySchedule[Schedule: hourly-critical-data (Hourly)]
    end

    DailySchedule --> VeleroServer
    HourlySchedule --> VeleroServer

    subgraph Kubernetes State Extraction
        VeleroServer --> ExtractK8s[Extract Namespaces, Deployments, CRDs, Secrets, ConfigMaps]
        VeleroServer --> ExtractPVC[Trigger Longhorn VolumeSnapshots via CSI Plugin]
    end

    subgraph Offsite Storage Destination
        BackupLocation[BackupStorageLocation: AWS S3 / MinIO Object Storage]
        SnapshotLocation[VolumeSnapshotLocation: Longhorn CSI Target]
    end

    ExtractK8s -->|Compress & Encrypt Tarball| BackupLocation
    ExtractPVC -->|Stream Block Snapshots| SnapshotLocation
```

---

## 2. Backup Schedules (`platform/backup/velero/schedules/`)

### 2.1 Daily Full Cluster DR Schedule (`schedule-daily-dr.yaml`)
- **Cron Expression**: `0 2 * * *` (02:00 UTC Daily).
- **Retention (TTL)**: `720h` (30 Days).
- **Included Namespaces**: `kcm-system`, `cnpg-system`, `monitoring`, `falco`, `ingress-gateway`.
- **Snapshot Volumes**: `true`.

### 2.2 Hourly Critical Configuration Schedule (`schedule-hourly-config.yaml`)
- **Cron Expression**: `0 * * * *` (Hourly).
- **Retention (TTL)**: `168h` (7 Days).
- **Included Resources**: `secrets`, `configmaps`, `certificates`, `httproutes`.

---

## 3. Restore Procedures (`platform/backup/velero/restore/`)

To restore a specific namespace or the entire cluster after a catastrophic failure:

```bash
# 1. List available Velero backups in S3
velero backup get

# 2. Trigger namespace restoration from latest daily backup
velero restore create --from-backup daily-cluster-dr-20260828020000 \
  --include-namespaces kcm-system,cnpg-system \
  --restore-volumes=true

# 3. Monitor restore execution progress
velero restore describe <restore_name> --details
```

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `Backup PartiallyFailed (VolumeSnapshot timeout)` | Heavy disk I/O on large persistent volume during snapshot | Adjust `volumeSnapshotTimeout: 30m` in Velero server deployment. |
| `S3 Access Denied: 403 Forbidden` | Expired AWS/S3 access keys in `backup-secret.yaml` | Rotate S3 bucket IAM credentials in the Kubernetes Velero secret. |

---

## Security Considerations
- S3 backup buckets enforce Server-Side Encryption (SSE-S3 or SSE-KMS) and Object Lock (WORM compliance) to protect backups against ransomware deletion.

## Related Documentation
- [Longhorn.md](Longhorn.md) — Persistent block storage.
- [Backup-Restore.md](Backup-Restore.md) — Comprehensive recovery runbooks.
- [Disaster-Recovery.md](Disaster-Recovery.md) — SLA, RTO, and RPO specifications.
