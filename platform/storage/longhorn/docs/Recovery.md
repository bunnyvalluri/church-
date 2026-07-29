# Storage Recovery & Disaster Recovery Plan

## SLA Objectives
- **Recovery Point Objective (RPO)**:
  - Critical Database (CloudNativePG): 1 Hour (Local Snapshot) / 24 Hours (Offsite S3).
  - General Storage / Logs: 24 Hours.
- **Recovery Time Objective (RTO)**:
  - Single Replica / Volume Failure: < 30 seconds (Automatic Failover).
  - Node Failure: < 2 minutes (Pod rescheduling to replica node).
  - Total Disaster Recovery (Cluster Loss): < 1 Hour (S3 Backup Restore).

---

## Recovery Scenarios & Execution

### Scenario A: Single Node Loss
1. Kubernetes reschedules workload pod onto surviving node containing a synchronous volume replica.
2. Longhorn engine attaches volume immediately without data rebuild delay.
3. In the background, Longhorn provisions a 3rd replica on an available node.

### Scenario B: Storage Corruption / Disaster
1. Provision fresh Kubernetes cluster.
2. Deploy Longhorn via Argo CD.
3. Configure `backupTarget` pointing to existing S3 bucket.
4. Restore PVCs from S3 backups using standard PVC manifests (`fromBackup`).
