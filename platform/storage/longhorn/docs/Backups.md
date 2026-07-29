# Longhorn Offsite Backups & Velero Integration

## Remote S3 Backup Architecture
While snapshots reside on local cluster disks, Backups are exported as compressed block chunks to offsite object storage (AWS S3 / S3-compatible).

---

## BackupStore Configuration
- **S3 Bucket Endpoint**: `s3://kcm-church-longhorn-backups@us-east-1/`
- **Compression**: `lz4` (high speed, minimal CPU overhead)
- **Encryption**: AES-256 server-side encryption enabled at S3 level.
- **Concurrent Limits**: Maximum 3 concurrent backup streams per node.

---

## Velero CSI Integration
Longhorn volume backups are integrated with Velero via the Kubernetes CSI Snapshotter:
1. Velero triggers a `VolumeSnapshot` CRD via CSI.
2. Longhorn CSI Driver captures volume block state.
3. Velero uploads cluster manifests while Longhorn syncs delta blocks to `longhorn-velero-bsl` bucket.
