# Runbook: Storage Disk Replacement

## Overview
This runbook provides step-by-step procedures for replacing a degraded or failed storage disk on a Kubernetes node running Longhorn storage manager without downtime for cluster workloads.

---

## Prerequisites
- kubectl admin privileges on the Kubernetes cluster.
- Longhorn UI or CLI access.
- Replacement disk installed or prepared on the target host node.

---

## Step-by-Step Execution

### Step 1: Identify Degraded or Failing Disk
Check node disk status in Longhorn UI or using kubectl:
```bash
kubectl get node.longhorn.io -n longhorn-system
```
Identify the disk path (e.g., `/var/lib/longhorn` or `/mnt/disks/nvme1`).

### Step 2: Disable Scheduling on Target Disk
In Longhorn UI (Node -> Edit Disks) or patch the Node CRD:
- Set `allowScheduling: false` on the target disk.
- Set `evictionRequested: true` to trigger automatic replica migration off the failing disk.

### Step 3: Verify Replica Eviction
Wait until all replicas on the target disk have migrated to healthy nodes:
```bash
kubectl get replicas.longhorn.io -n longhorn-system -o wide | grep <failing-disk-name>
```
Confirm replica count for all affected volumes displays `3/3 healthy`.

### Step 4: Unmount & Replace Physical Disk
1. Unmount old disk mountpoint on the host node:
   ```bash
   sudo umount /mnt/disks/nvme1
   ```
2. Replace physical hardware / swap block device.
3. Format new disk with ext4/xfs and update `/etc/fstab`:
   ```bash
   sudo mkfs.ext4 -F /dev/nvme1n1
   sudo mount -a
   ```

### Step 5: Re-enable Scheduling on New Disk
1. Update Longhorn Node disk configuration:
   - Set `allowScheduling: true`.
   - Set `evictionRequested: false`.
2. Verify Longhorn automatically detects available space on the new disk.
