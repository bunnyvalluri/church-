# Runbook: Replica Rebuilding & Self-Healing

## Overview
How to diagnose and force-rebuild degraded volume replicas in Longhorn.

---

## Symptoms
- Alert `LonghornReplicaDegraded` firing.
- Longhorn UI shows volume status `Degraded` (e.g., 2/3 replicas healthy).

---

## Recovery Steps

### 1. Check Replica Rebuild Status
Inspect active replica rebuild jobs in `longhorn-system`:
```bash
kubectl get replicas.longhorn.io -n longhorn-system | grep degraded
```

### 2. Verify Available Storage Space
Ensure remaining cluster nodes have sufficient free disk space to accommodate a new replica:
```bash
kubectl get nodes.longhorn.io -n longhorn-system -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.diskStatus.*.storageAvailable}{"\n"}{end}'
```

### 3. Force Replica Deletion (Trigger Fresh Sync)
If a degraded replica is stuck in `failed` state, delete the failed replica CRD to let Longhorn Manager provision a fresh replacement on a healthy node:
```bash
kubectl delete replica.longhorn.io <replica-name> -n longhorn-system
```
Longhorn engine will allocate space on an eligible node and start snapshot stream synchronization.
