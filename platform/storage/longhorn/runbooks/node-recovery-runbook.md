# Runbook: Kubernetes Node Recovery & Maintenance

## Overview
Procedure for taking a Longhorn storage node down for maintenance or recovering from an unexpected node crash without loss of data integrity.

---

## Controlled Node Drain / Maintenance

### Step 1: Cordon Node
Prevent new pods from scheduling:
```bash
kubectl cordon <node-name>
```

### Step 2: Set Longhorn Node Eviction
Request Longhorn engine to migrate non-last replicas off the node:
```bash
kubectl patch nodes.longhorn.io <node-name> -n longhorn-system --type merge -p '{"spec":{"allowScheduling":false,"evictionRequested":true}}'
```

### Step 3: Drain Node
Safely drain workloads:
```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --grace-period=300
```

### Step 4: Maintenance / Reboot
Perform maintenance or OS kernel upgrades, then reboot the node.

### Step 5: Uncordon & Restore Node Scheduling
```bash
kubectl uncordon <node-name>
kubectl patch nodes.longhorn.io <node-name> -n longhorn-system --type merge -p '{"spec":{"allowScheduling":true,"evictionRequested":false}}'
```
Longhorn will automatically rebuild degraded volume replicas in the background.
