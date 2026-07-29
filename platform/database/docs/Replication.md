# Replication & High Availability Architecture

## Overview
Streaming replication runs asynchronously between the primary and two standby replicas across separate nodes with anti-affinity constraints.

### Replication Status Command
```bash
kubectl cnpg status kcm-db-cluster -n kcm-database
```
