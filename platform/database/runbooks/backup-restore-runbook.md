# On-Demand Backup & Physical Restore Runbook

## Triggering an On-Demand Physical Backup

To manually take an instant full physical backup of `kcm-db-cluster`:

```bash
kubectl cnpg backup kcm-db-cluster -n kcm-database --backup-name manual-kcm-backup-$(date +%s)
```

Verify backup status:

```bash
kubectl get backups.postgresql.cnpg.io -n kcm-database
```

---

## Verifying Backup Integrity

Check S3 bucket WAL archives and base physical backups:

```bash
aws s3 ls s3://kcm-database-backups-prod/cnpg-wal/
```
