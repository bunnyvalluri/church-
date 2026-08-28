# Disaster Recovery (DR) & Business Continuity Plan

## Purpose
This document provides the technical disaster recovery plan, Recovery Point Objectives (RPO), Recovery Time Objectives (RTO), and incident playbooks for major operational failure scenarios across the Kingdom of Christ Ministries platform.

## Scope
Covers database failure, node failure, storage corruption, full cluster loss, and multi-region disaster scenarios.

## Status
> Status: Implemented & Validated

---

## 1. Disaster Recovery Service Level Objectives (SLOs)

| Metric | Target SLA | Implementation Mechanism |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | `<= 5 Minutes` | CloudNativePG continuous WAL archiving to S3 + MongoDB Atlas multi-AZ replication |
| **Recovery Time Objective (RTO)** | `<= 30 Minutes` | Declarative OpenTofu IaC + GitOps Argo CD + Velero namespace restoration |
| **High Availability SLA** | `99.95%` | Multi-pod replicas, 3-node PostgreSQL cluster, Longhorn 3-way storage replication |

---

## 2. Disaster Scenarios & Response Matrix

```mermaid
graph TD
    DisasterEvent{Disaster Event Occurs}
    
    DisasterEvent -->|Scenario 1: Single Pod Crash| AutoK8s[Kubernetes Kubelet: Instant Pod Restart (<5s)]
    DisasterEvent -->|Scenario 2: Node Hardware Failure| AutoReschedule[K8s Node Controller: Reschedule Pods (<60s)]
    DisasterEvent -->|Scenario 3: DB Primary Failure| AutoCNPG[CloudNativePG: Auto Failover to Sync Standby (<10s)]
    DisasterEvent -->|Scenario 4: Storage Volume Corrupt| LonghornRestore[Restore Longhorn Volume from S3 Snapshot (<10m)]
    DisasterEvent -->|Scenario 5: Full Cluster Loss| FullDR[Full Disaster Recovery via OpenTofu + Velero (<30m)]
```

### Scenario 1: Single Pod Crash
- **Symptom**: Pod enters `CrashLoopBackOff` or is killed by OOM.
- **Automated Response**: Kubernetes Deployment controller maintains replica count, immediately scheduling a replacement pod.
- **RTO**: `< 5 seconds`. **RPO**: `0 seconds` (Zero data loss).

### Scenario 2: Kubernetes Worker Node Failure
- **Symptom**: Host node stops sending heartbeats (`NodeNotReady`).
- **Automated Response**: Kubernetes evicts pods from failed node and reschedules on healthy nodes. Longhorn attaches replicated block volume from healthy nodes.
- **RTO**: `< 60 seconds`. **RPO**: `0 seconds`.

### Scenario 3: Database Primary Instance Failure
- **Symptom**: PostgreSQL master pod crashes or underlying disk becomes inaccessible.
- **Automated Response**: CloudNativePG operator promotes synchronous standby to master. PgBouncer transparently shifts traffic.
- **RTO**: `< 10 seconds`. **RPO**: `0 seconds`.

### Scenario 4: Accidental Database Data Corruption / Deletion
- **Symptom**: Administrative script accidentally deletes or updates records without where clause.
- **Procedure**: Execute Point-in-Time Recovery (PITR) to replay WAL logs up to 1 minute prior to the corruption event.
- **RTO**: `< 15 minutes`. **RPO**: `< 1 minute`.

### Scenario 5: Catastrophic Cluster or Data Center Loss
- **Symptom**: Entire cloud region or Kubernetes control plane destroyed.
- **Procedure**:
  1. Provision fresh Kubernetes cluster using OpenTofu (`tofu apply`).
  2. Install Velero operator and connect to offsite S3 backup bucket.
  3. Execute `velero restore create --from-backup latest-dr-backup`.
  4. Argo CD synchronizes all remaining GitOps manifests.
  5. Update DNS A/CNAME records to point to new cluster Envoy Gateway IP.
- **RTO**: `< 30 minutes`. **RPO**: `<= 5 minutes`.

---

## 3. Communication & Status Page Protocol

During any SEV-1 outage:
1. Operations team posts incident status to `status.kcmchurch.org`.
2. Pastoral leadership is notified via SMS broadcast.
3. Post-incident Root Cause Analysis (RCA) document is generated within 24 hours.

---

## Security Considerations
- Offsite backup credentials are maintained in an isolated, multi-factor authenticated security vault.

## Related Documentation
- [Backup-Restore.md](Backup-Restore.md) — Operational backup commands.
- [Incident-Response.md](Incident-Response.md) — Severity classification.
- [CloudNativePG.md](CloudNativePG.md) — Database failover architecture.
