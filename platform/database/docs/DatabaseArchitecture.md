# Kingdom of Christ Ministries - Database Architecture Specification

## Architecture Overview
The KCM Enterprise Database Platform is built on top of official **CloudNativePG v1.23** deployed in Kubernetes. It provides a production-ready, highly available, secure, and self-healing PostgreSQL cluster tailored for Node.js/Express and Next.js applications using Prisma ORM.

### Architecture Diagram (Mermaid)

```mermaid
graph TD
    Client[Next.js App / Express Backend] --> |Prisma RW Queries| PgBouncerRW[PgBouncer RW Pooler]
    Client --> |Prisma RO Queries| PgBouncerRO[PgBouncer RO Pooler]

    subgraph Kubernetes Namespace: kcm-database
        PgBouncerRW --> |Port 5432| Primary[PostgreSQL Node 1 - Primary]
        PgBouncerRO --> |Port 5432| Replica1[PostgreSQL Node 2 - Standby Replica]
        PgBouncerRO --> |Port 5432| Replica2[PostgreSQL Node 3 - Standby Replica]

        Primary --> |Streaming Replication| Replica1
        Primary --> |Streaming Replication| Replica2
    end

    subgraph External Storage & Observability
        Primary --> |Continuous WAL Archive| S3[AWS S3 / MinIO Object Storage]
        Primary --> |Metrics Exporter :9187| Prometheus[Prometheus & Grafana]
    end
```

## Key Components
1. **CloudNativePG Operator**: Manages cluster lifecycle, failover, rolling updates, and backups.
2. **3-Node PostgreSQL HA Cluster**: 1 Primary + 2 Standby Replicas spread across nodes.
3. **PgBouncer Connection Poolers**: Dedicated Transaction-mode poolers for Read-Write and Read-Only traffic.
4. **Barman Object Store**: Streaming WAL archiving and physical base backups for PITR up to 30 days.
5. **Observability**: Prometheus `PodMonitor`, Grafana dashboard, and Alertmanager rules.
