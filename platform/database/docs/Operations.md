# Platform Day-2 Operations Manual

## Cluster Administration Commands

```bash
# Check status of cluster
kubectl cnpg status kcm-db-cluster -n kcm-database

# Reload PostgreSQL configuration without restart
kubectl cnpg reload kcm-db-cluster -n kcm-database

# Gracefully restart cluster pods in rolling sequence
kubectl cnpg restart kcm-db-cluster -n kcm-database
```
