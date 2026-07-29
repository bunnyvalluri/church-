# Runbook: CloudNativePG PostgreSQL & Redis Restore Procedure

## 1. CloudNativePG PostgreSQL Volume & Snapshot Restore

### Selective Restore via Velero

```bash
# Restore kcm-database namespace from latest hourly critical backup
kubectl apply -f platform/backup/velero/restore/restore-database-disaster.yaml
```

### Point-In-Time Recovery (PITR) with CloudNativePG WAL Logs

When restoring PostgreSQL to a specific timestamp using CloudNativePG native WAL recovery:

1. Update CloudNativePG `Cluster` spec with `bootstrap.recovery.backup`:
   ```yaml
   apiVersion: postgresql.cnpg.io/v1
   kind: Cluster
   metadata:
     name: kcm-postgres-restored
     namespace: kcm-database
   spec:
     instances: 3
     storage:
       size: 50Gi
     bootstrap:
       recovery:
         source: kcm-postgres-cluster
         recoveryTarget:
           targetTime: "2026-07-29 12:00:00.000000+00"
   ```

2. Monitor CloudNativePG recovery pod logs until state is `Cluster in healthy state`.

---

## 2. Redis Cache Recovery Procedure

1. Trigger Velero restore for namespace `kcm-cache`:
   ```bash
   velero restore create redis-restore --from-backup kcm-hourly-critical-workloads-latest --include-namespaces kcm-cache
   ```
2. Verify persistent volume claim binding and Redis pod initialization from `dump.rdb` or PVC.
