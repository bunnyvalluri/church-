# Velero Restore Procedures & Execution

## Types of Restores

1. **Namespace Restore**: Restores single application namespaces (`kcm-app`, `kcm-cache`) isolated from cluster dependencies.
2. **Database Volume Restore**: Restores PostgreSQL CloudNativePG persistent volumes using CSI volume snapshots.
3. **Selective Resource Filtering**: Restores specific deployments, secrets, or configmaps using label selectors (`velero restore create --selector app=frontend`).
4. **Cross-Cluster Migration**: Restores state to a newly provisioned Kubernetes cluster in a secondary region.

## Example CLI Commands

```bash
# Restore specific namespace
velero restore create app-restore --from-backup kcm-daily-cluster-backup-latest --include-namespaces kcm-app

# Restore database workloads with namespace remapping
velero restore create db-test-restore --from-backup kcm-hourly-critical-workloads-latest --namespace-mappings kcm-database:kcm-database-test
```
