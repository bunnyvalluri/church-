# Enterprise Backup Strategy

## Tiered Backup Model

| Backup Tier | Frequency | Target Workloads | Retention TTL | Backup Type |
| :--- | :--- | :--- | :--- | :--- |
| **Hourly Critical** | `0 * * * *` | `kcm-database`, `kcm-cache`, `kcm-app` | 72 Hours (3 Days) | CSI VolumeSnapshot + Pod Execution Hooks |
| **Daily Cluster** | `0 2 * * *` | Full Cluster Namespaces & CRDs | 30 Days | Full Resource Manifests + PV Snapshots |
| **Weekly DR** | `0 3 * * 0` | All Namespaces & Cluster Resources | 90 Days | Full Cluster Snapshot + Offsite S3 Sync |
| **Monthly Compliance** | `0 4 1 * *` | Core System & Database Workloads | 365 Days | Immutable Compliance Archive |

## Application Consistency & Hooks
- **PostgreSQL (CloudNativePG)**: Executes `pg_backup_start()` before snapshot and `pg_backup_stop()` post-snapshot to force dirty page WAL flushes.
- **Redis Cache**: Triggers `BGSAVE` pre-hook to flush in-memory data structures to `dump.rdb`.
