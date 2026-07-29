# Runbook: Disaster Recovery Volume Restoration

## Overview
Procedures for restoring critical volumes (CloudNativePG, Redis, Loki) from offsite S3 backups into a fresh or recovered Kubernetes cluster.

---

## Restoration Procedure

### Step 1: Verify S3 Backup Target Connection
Confirm Longhorn BackupStore is active and synced with S3:
```bash
kubectl get backupvolumes.longhorn.io -n longhorn-system
```

### Step 2: Identify Target Backup Name
List available backups for the desired volume:
```bash
kubectl get backups.longhorn.io -n longhorn-system
```

### Step 3: Restore Volume via StorageClass / PVC
Create a PVC specifying `fromBackup` parameter or apply a restored PVC template:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cloudnativepg-restored-pvc
  namespace: database
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn-cloudnativepg
  resources:
    requests:
      storage: 100Gi
```
Longhorn CSI driver will pull snapshot blocks from S3 and populate the new volume automatically.

### Step 4: Attach Workload
Deploy PostgreSQL / database pod referencing `cloudnativepg-restored-pvc`. Verify data integrity via application diagnostics.
