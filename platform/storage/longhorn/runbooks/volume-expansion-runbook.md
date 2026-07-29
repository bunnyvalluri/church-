# Runbook: Live Volume Expansion

## Overview
Instructions for dynamically expanding a Longhorn PersistentVolume without downtime.

---

## Dynamic Expansion Steps

### Step 1: Edit PVC Request Size
Update the `spec.resources.requests.storage` field of target PVC:
```bash
kubectl edit pvc cloudnativepg-data-pvc -n database
```
Change `storage: 100Gi` to `storage: 200Gi`.

### Step 2: Monitor CSI Expansion Status
```bash
kubectl get pvc cloudnativepg-data-pvc -n database -o yaml
```
Verify conditions show `FileSystemResizePending` or `Resizing`.

### Step 3: Online Filesystem Expansion
Longhorn CSI driver automatically expands the underlying volume and resizes the ext4/xfs filesystem while mounted to the active pod.

### Step 4: Verify Expanded Size
```bash
kubectl exec -it <pod-name> -n database -- df -h /var/lib/postgresql/data
```
Confirm mount capacity reports 200GB.
