# GitOps Management with Argo CD

## GitOps Architecture
All components of the Velero Backup platform are declaratively managed through Argo CD applications located under `platform/backup/velero/argocd/`.

1. **`velero-platform`**: Synchronizes the official Velero Helm chart deployment using `platform/backup/velero/helm/values.yaml`.
2. **`velero-schedules-and-storage`**: Synchronizes BackupStorageLocations, VolumeSnapshotLocations, Backup Schedules, and Hooks.

```bash
# Check Argo CD sync status
argocd app get velero-platform
argocd app get velero-schedules-and-storage
```
