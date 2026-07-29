# Velero Backup Schedules Specifications

## Active Schedules Summary

| Schedule Manifest | Cron Expression | Namespaces Included | Hooks Configured | Retention |
| :--- | :--- | :--- | :--- | :--- |
| `schedule-hourly-critical.yaml` | `0 * * * *` | `kcm-database`, `kcm-cache`, `kcm-app` | Yes (CNPG & Redis) | 72 Hours |
| `schedule-daily-cluster.yaml` | `0 2 * * *` | All Namespaces (Excl. Velero/System) | No | 30 Days |
| `schedule-weekly-disaster-recovery.yaml` | `0 3 * * 0` | All Namespaces & Cluster Resources | No | 90 Days |
| `schedule-monthly-archive.yaml` | `0 4 1 * *` | Critical Core & Ingress | No | 365 Days |
