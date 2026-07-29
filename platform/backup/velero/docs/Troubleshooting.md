# Troubleshooting Guide

## Diagnostic Cheat Sheet

```bash
# Get overall status of Velero deployment
kubectl get pods -n velero

# Inspect Velero server logs
kubectl logs deploy/velero -n velero --tail=100

# Inspect Node Agent logs
kubectl logs ds/velero-node-agent -n velero -c node-agent --tail=100

# Test S3 storage location connectivity
velero backup-location get
```

## Known Edge Cases

### 1. VolumeSnapshot stuck in Pending state
- **Cause**: CSI driver missing `VolumeSnapshotClass` or cloud provider volume snapshot limit reached.
- **Fix**: Check `kubectl get volumesnapshot -A` and describe the pending snapshot resource.

### 2. Node Agent Pod Volume Backup Failed
- **Cause**: Path `/var/lib/kubelet/pods` improperly mounted or permission issue.
- **Fix**: Verify hostPath mount in `nodeAgent.podVolumePath` within `values.yaml`.
