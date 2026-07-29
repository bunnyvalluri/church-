# Disaster Recovery (DR) & PITR Runbook

## Objective
Restore the KCM Church PostgreSQL database to a clean state following catastrophic data loss or cluster destruction using continuous Barman WAL archives from S3.

---

## Step 1: Identify Recovery Target Timestamp
Identify the exact UTC timestamp before data corruption or event occurred (e.g., `2026-07-29 02:00:00.000000+00`).

---

## Step 2: Apply PITR Restore Cluster Manifest

Apply `platform/database/backups/pitr-restore.yaml`:

```bash
kubectl apply -f platform/database/backups/pitr-restore.yaml -n kcm-database
```

---

## Step 3: Monitor Recovery Process

```bash
# Watch pod initialization & WAL restoration
kubectl get pods -n kcm-database -w

# Check CloudNativePG restoration logs
kubectl logs -f -n kcm-database kcm-db-pitr-restored-1 -c bootstrap
```

---

## Step 4: Cut Over Application Traffic

Update the application database endpoints or switch the service selector:

```bash
kubectl patch service kcm-db-cluster-rw -n kcm-database -p '{"spec":{"selector":{"cnpg.io/cluster":"kcm-db-pitr-restored"}}}'
```
