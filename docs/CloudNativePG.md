# CloudNativePG High-Availability PostgreSQL Operator

## Purpose
This document provides the authoritative technical specification for CloudNativePG (CNPG), the Kubernetes-native operator managing high-availability PostgreSQL clusters, automated failover, streaming replication, continuous WAL archiving, Point-in-Time Recovery (PITR), and PgBouncer connection pooling for the Kingdom of Christ Ministries platform.

## Scope
Covers manifests in `platform/database/`, operator deployments, cluster definitions (`kcm-db-cluster.yaml`), and database disaster recovery runbooks.

## Status
> Status: Implemented

---

## 1. CloudNativePG Cluster Topology

```mermaid
graph TD
    subgraph Kubernetes Namespace: kcm-system
        AppPods[Next.js & Backend Application Pods]
        PgBouncerService[PgBouncer Service: kcm-db-pooler:5432]
        
        subgraph CloudNativePG 3-Node HA Cluster
            PGPrimary[(Node 1: PostgreSQL Primary / Read-Write)]
            PGStandby1[(Node 2: Sync Standby / Read-Only)]
            PGStandby2[(Node 3: Async Standby / Read-Only)]
        end
    end

    AppPods --> PgBouncerService
    PgBouncerService --> PGPrimary
    
    PGPrimary -->|Streaming Physical Replication| PGStandby1
    PGPrimary -->|Streaming Physical Replication| PGStandby2

    subgraph Continuous WAL Archiving & Object Storage
        PGPrimary -->|Stream WAL every 5 min (Barman Cloud)| S3Storage[(S3 Bucket: kcm-database-wal)]
        CNPGScheduledBackup[ScheduledBackup CRD: Nightly 01:00 UTC] --> S3Storage
    end

    subgraph Observability
        CNPGPodMonitor[CloudNativePG PodMonitor] --> Prometheus[Prometheus Operator]
        Prometheus --> GrafanaDashboard[Grafana PostgreSQL Dashboard]
    end
```

---

## 2. Cluster Manifest Specification (`platform/database/clusters/kcm-db-cluster.yaml`)

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: kcm-db-cluster
  namespace: kcm-system
spec:
  instances: 3
  imageName: ghcr.io/cloudnative-pg/postgresql:16.2
  primaryUpdateStrategy: unsupervised
  storage:
    storageClass: longhorn-cloudnativepg
    size: 50Gi
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  postgresql:
    parameters:
      shared_buffers: 1024MB
      effective_cache_size: 3072MB
      maintenance_work_mem: 256MB
      checkpoint_completion_target: "0.9"
      wal_buffers: 16MB
      default_statistics_target: "100"
      random_page_cost: "1.1"
      max_connections: "200"
  backup:
    barmanObjectStore:
      destinationPath: s3://kcm-database-wal/
      endpointURL: https://s3.amazonaws.com
      s3Credentials:
        accessKeyId:
          name: cnpg-s3-secret
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: cnpg-s3-secret
          key: SECRET_ACCESS_KEY
      wal:
        compression: gzip
        maxParallel: 2
```

---

## 3. Automated Failover & High Availability

- **Consensus Health Check**: The CNPG operator continuously monitors pod health via PostgreSQL replication status and Kubernetes API probes.
- **Failover SLA**: If the primary instance crashes or becomes uncontactable, the operator automatically promotes the synchronous standby (`kcm-db-cluster-2`) to primary within **< 10 seconds**.
- **PgBouncer Transparent Rerouting**: The PgBouncer pooler automatically switches client traffic to the newly promoted primary instance without application downtime.

---

## 4. Continuous WAL Archiving & Point-in-Time Recovery (PITR)

- **Continuous Archiving**: Write-Ahead Log (WAL) files are compressed with gzip and shipped to the S3 bucket every 5 minutes or upon filling a 16MB segment.
- **PITR Restore (`platform/database/backups/pitr-restore.yaml`)**: Enables restoring the database to any specific second in time (e.g. `recoveryTargetTime: "2026-08-28T14:30:00Z"`) to recover from accidental administrative data deletion.

---

## 5. Operational Runbooks (`platform/database/runbooks/`)

- `failover-runbook.md`: Procedures for triggering manual switchovers during node maintenance.
- `backup-restore-runbook.md`: Standard recovery procedures from base backups.
- `disaster-recovery-runbook.md`: Cross-region restoration into a fresh Kubernetes cluster.

---

## 6. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Standby pod falling behind in replication | Disk I/O bottleneck on standby storage volume | Inspect Longhorn storage latency and scale storageClass IOPS. |
| WAL archiving failing with S3 connection error | Invalid S3 credentials or network policy blocking egress to S3 | Verify `cnpg-s3-secret` and verify Kubernetes NetworkPolicy allows outbound port 443 traffic. |

---

## Security Considerations
- Client TLS certificates are generated automatically by CloudNativePG for all internal connections.
- Database passwords use SCRAM-SHA-256 cryptographic hashing.

## Related Documentation
- [PostgreSQL.md](PostgreSQL.md) — Relational data model and Prisma client.
- [Database-Architecture.md](Database-Architecture.md) — Multi-database topology.
- [Longhorn.md](Longhorn.md) — Underlying block storage configuration.
