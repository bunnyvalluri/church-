# Disaster Recovery Plan & Business Continuity

## Metrics & Targets
- **Recovery Time Objective (RTO)**: Target < 4 Hours for complete cluster restoration.
- **Recovery Point Objective (RPO)**: Target < 1 Hour for transactional databases and critical application state.

## Failover Workflow

```mermaid
sequenceDiagram
    participant Admin as DR Lead
    participant IaC as OpenTofu
    participant K8s as DR Cluster
    participant Velero as Velero Server
    participant S3 as S3 Primary/DR Bucket

    Admin->>IaC: Provision DR Kubernetes Cluster in Secondary Region
    IaC-->>K8s: Cluster Active
    Admin->>K8s: Deploy Velero with S3 Access Credentials
    Velero->>S3: Scan Backup Metadata
    S3-->>Velero: Return Backup Catalog
    Admin->>K8s: Apply restore-cross-cluster.yaml
    Velero->>K8s: Reconstruct PVs, Deployments, Secrets, CRDs
    Admin->>K8s: Run restore-validation-job.yaml
```
