# Operational Runbooks - KCM Church Platform

## Runbook 1: Emergency Cluster Disaster Recovery

### Scenario
Complete loss of Kubernetes cluster or cloud region failure.

### Steps
1. Provision new Kubernetes v1.28+ cluster.
2. Configure local `kubectl` context to point to the new cluster.
3. Execute the automated cluster restoration script:
   ```bash
   cd kcm-church-infra/disaster-recovery
   chmod +x cluster-restore-script.sh
   ./cluster-restore-script.sh
   ```
4. Verify all Argo CD applications reach `Synced` and `Healthy` status.

---

## Runbook 2: Manual Database Restoration from Backup

### Scenario
Data corruption or accidental database deletion.

### Steps
1. Locate latest encrypted backup in `/backups` persistent storage.
2. Exec into the PostgreSQL StatefulSet container:
   ```bash
   kubectl exec -it -n kcm-prod statefulset/postgres-db -- sh
   ```
3. Drop and re-create database schema:
   ```sql
   DROP DATABASE kcm_db;
   CREATE DATABASE kcm_db;
   ```
4. Restore data from latest snapshot:
   ```bash
   zcat /backups/kcm_db_20260728_020000.sql.gz | psql -U kcm_user -d kcm_db
   ```

---

## Runbook 3: Manual Scaling During Peak Church Events

### Scenario
High traffic surge expected during Sunday online services or major church conferences.

### Steps
```bash
# Temporarily increase minimum replicas on Frontend HPA
kubectl autoscale deployment kcm-frontend -n kcm-prod --min=5 --max=20

# Scale Backend API deployments
kubectl scale deployment/kcm-backend-api-api -n kcm-prod --replicas=8
```
