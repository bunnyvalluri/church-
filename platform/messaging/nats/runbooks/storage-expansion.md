# Operational Runbook: JetStream Persistent Storage Expansion

## Objective
Safely expand Longhorn PVC persistent storage for JetStream stream retention without interrupting live messaging operations.

## Step-by-Step Expansion

### 1. Check Longhorn Storage Capacity & PVC Status
```bash
kubectl get pvc -n messaging -l app.kubernetes.io/name=nats
```

### 2. Update OpenTofu / Helm Values Configuration
Update `storage_size` in `platform/messaging/nats/opentofu/variables.tf` or `platform/messaging/nats/helm/values.yaml`:
```yaml
storage_size: "100Gi"
```

### 3. Expand PersistentVolumeClaim Manifest
Apply resized PVC definition directly or through GitOps sync:
```bash
kubectl patch pvc data-nats-0 -n messaging -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
kubectl patch pvc data-nats-1 -n messaging -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
kubectl patch pvc data-nats-2 -n messaging -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
```

### 4. Verify Filesystem Resizing
Longhorn automatically resizes the underlying block volume online.
```bash
kubectl exec -it nats-0 -n messaging -- df -h /data/jetstream
```
