# Velero Enterprise Backup & Disaster Recovery Architecture

## System Overview
The Kingdom of Christ Ministries (KCM Church) Enterprise Kubernetes Backup and Disaster Recovery Platform utilizes the official Velero project (`https://github.com/velero-io/velero.git`) to provide continuous protection, point-in-time state recovery, cross-region disaster recovery, and GitOps-managed lifecycle operations.

```mermaid
flowchart TD
    subgraph K8sCluster["Kubernetes Production Cluster"]
        VeleroServer["Velero Server Pod (v1.14)"]
        NodeAgent["Node Agent (DaemonSet / Kopia)"]
        CSIPlugin["Velero Plugin for CSI"]
        AWSPlugin["Velero Plugin for AWS"]
        
        subgraph Workloads["Workload Namespaces"]
            CNPG["CloudNativePG (PostgreSQL)"]
            Redis["Redis Cache"]
            AppPods["Next.js / Node.js Apps"]
        end
    end

    subgraph StorageBackends["Backup Storage Locations"]
        PrimaryS3["Primary AWS S3 / MinIO (KMS Encrypted)"]
        SecondaryS3["DR S3 Bucket (us-west-2 Read-Only)"]
        CSISnapshots["CSI EBS VolumeSnapshots"]
    end

    VeleroServer -->|Orchestrates Snapshots & Manifests| PrimaryS3
    VeleroServer -->|Triggers Volume Snapshots| CSISnapshots
    NodeAgent -->|File-System Backup (Kopia)| PrimaryS3
    PrimaryS3 -->|Replication| SecondaryS3
    VeleroServer -->|Pre/Post Execution Hooks| Workloads
```

## Key Architectural Components

1. **Velero Server (`velero-server`)**:
   - Highly available control plane controller orchestrating backup creation, storage location syncing, restore procedures, schedule triggers, and TTL expirations.

2. **Node Agent (`velero-node-agent`)**:
   - DaemonSet running on every Kubernetes node powered by Kopia file system backup engine. Captures persistent volume data when native CSI volume snapshots are unavailable.

3. **CSI Snapshot Integration**:
   - Leverages Kubernetes Container Storage Interface (CSI) VolumeSnapshots (`VolumeSnapshotClass`) for zero-downtime, crash-consistent volume backups.

4. **Storage Providers**:
   - S3-compatible primary object storage (`kcm-velero-backups`) with KMS server-side encryption, versioning, object locking, and lifecycle policies.
