# Runbook: Loki Storage / Disk Capacity Exhausted

## Symptom
- Loki alert `LokiStorageNearCapacity` triggered.
- `loki-write` StatefulSet pods rejecting incoming stream batches with HTTP 429 / HTTP 507.
- Log loss risk in high-traffic containers.

## Diagnostics
1. Check Loki storage PVC and object store utilization:
   ```bash
   kubectl exec -it -n logging statefulset/loki-write -- df -h /var/loki
   ```
2. Inspect Loki compactor state:
   ```bash
   kubectl logs -n logging -l app.kubernetes.io/component=backend --tail=100 | grep compactor
   ```

## Remediation
1. Trigger manual compaction and retention cleanup:
   ```bash
   kubectl exec -it -n logging statefulset/loki-write -- loki -config.file=/etc/loki/loki-config.yaml -target=compactor
   ```
2. Expand PVC volume capacity via OpenTofu / PVC patch:
   ```bash
   kubectl patch pvc loki-backend-pvc -n logging -p '{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}'
   ```
3. Verify chunk flushing and status:
   ```bash
   kubectl get pods -n logging -o wide
   ```
