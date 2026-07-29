# Monitoring & Observability Integration

## Prometheus Metrics Integration
Velero exposes Prometheus metrics on port `8085` at path `/metrics`.

### Key Metrics Monitored
- `velero_backup_success_total`: Total count of successful backup operations.
- `velero_backup_failure_total`: Total count of failed backup attempts.
- `velero_backup_duration_seconds`: Histogram of backup execution times.
- `velero_volume_snapshot_success_total`: Success counter for CSI volume snapshots.
- `velero_backup_tarball_size_bytes`: Total byte size of compressed backups in S3.

## Grafana Dashboard
Dashboard configuration is managed via [grafana-dashboard-velero.json](file:///c:/K.C.M-Portal/platform/backup/velero/monitoring/grafana-dashboard-velero.json).
