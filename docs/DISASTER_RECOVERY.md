# Disaster Recovery Plan

This document outlines the Disaster Recovery (DR) procedures for the Kingdom of Christ Ministries deployment.

## RPO and RTO
- **Recovery Point Objective (RPO)**: 24 hours (depending on DB backup frequency).
- **Recovery Time Objective (RTO)**: 1-4 hours (depending on cluster provisioning time).

## Data Backups

### PostgreSQL (Neon)
- **Strategy**: Neon provides automatic backups and Point-In-Time-Recovery (PITR).
- **Restore Procedure**: Use the Neon dashboard to restore the database to a specific point in time or spin up a new branch from a backup state and update the `DATABASE_URL` Kubernetes Secret.

### Redis
- **Strategy**: Redis is used for transient data (queues, socket.io pub/sub). Loss of Redis data implies lost in-flight WebSocket messages and dropped BullMQ jobs.
- **Restore Procedure**: Ensure Redis is highly available (e.g., ElastiCache or Redis Sentinel). If Redis fails entirely, restarting the pods will reconnect them to the new Redis instance. Lost queue jobs will need to be re-triggered by users.

### Cloudinary (Media)
- **Strategy**: Media files are hosted externally. Ensure Cloudinary account has its own backup/retention policy.

## Cluster Failure

If the entire Kubernetes cluster goes down:
1. **Provision New Cluster**: Use Terraform/EKSCTL/GKE to spin up a fresh cluster in a healthy region.
2. **Update DNS**: Point `kcmchurch.org` and `api.kcmchurch.org` to the new Ingress Load Balancer IP.
3. **Deploy Workloads**:
   Run the GitHub Actions pipeline or manually deploy using Helm/Kustomize:
   ```bash
   helm upgrade --install kcm-portal deploy/helm/kcm-portal -f deploy/kustomize/overlays/production/values-production.yaml -n kcm-production --create-namespace
   ```
4. **Verify Systems**: Check if Frontend and API are communicating, and Socket.io connects successfully.
