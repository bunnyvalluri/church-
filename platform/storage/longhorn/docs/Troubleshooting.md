# Longhorn Troubleshooting & Diagnostic Guide

## Diagnostics & Commands

### 1. Check Longhorn System Pods
```bash
kubectl get pods -n longhorn-system -o wide
```

### 2. View Longhorn Manager Logs
```bash
kubectl logs -n longhorn-system -l app=longhorn-manager --tail=200 -f
```

### 3. Check Instance Manager Logs
```bash
kubectl logs -n longhorn-system -l longhorn.io/component=instance-manager --tail=200
```

---

## Common Issues & Solutions

### Issue A: Volume Stuck in `Attaching` State
- **Cause**: iSCSI initiator daemon (`iscsid`) not running on destination node, or previous pod did not unmount cleanly.
- **Solution**:
  ```bash
  sudo systemctl restart iscsid
  kubectl get volume.longhorn.io <vol-name> -n longhorn-system -o yaml
  ```

### Issue B: Backup Target Connection Error (`AccessDenied` / `NoSuchBucket`)
- **Cause**: Invalid AWS S3 access keys in Secret `longhorn-s3-backup-secret`.
- **Solution**: Verify Secret stringData key values and verify bucket S3 endpoint reachability.
