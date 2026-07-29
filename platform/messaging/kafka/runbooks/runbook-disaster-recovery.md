# Operational Runbook: Disaster Recovery & Longhorn Restore

## Overview
Protocol for restoring Kafka stateful volumes and KRaft cluster metadata from Longhorn snapshots and Velero backups.

## Volume Backup & Snapshot Protocol
- Longhorn automatically creates snapshots every 6 hours and backs up to object storage.
- Velero performs cluster manifest and secret backups daily.

## Recovery Execution
1. Restore Velero backups for messaging namespace manifests and secrets:
   ```bash
   velero restore create --from-backup kcm-kafka-daily-backup
   ```
2. Restore Longhorn volumes from snapshot:
   ```bash
   kubectl apply -f platform/storage/longhorn/volumes/kafka-restore-pvc.yaml
   ```
3. Restart Kafka StatefulSet in sequence to re-establish KRaft quorum:
   ```bash
   kubectl rollout restart statefulset/kcm-kafka -n messaging
   ```
