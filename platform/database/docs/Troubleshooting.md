# Database Troubleshooting & Diagnostic Guide

## Common Symptoms & Solutions

### 1. High Connection Usage / Timeout Errors
- **Symptom**: Prisma throws `Too many connections` or `Client connection pool exhausted`.
- **Diagnostic**: `kubectl logs -n kcm-database -l cnpg.io/poder=kcm-db-pooler-rw`
- **Resolution**: Scale PgBouncer HPA or inspect unclosed backend connections.

### 2. High Replication Lag
- **Symptom**: Replica queries return stale data.
- **Diagnostic**: `kubectl cnpg status kcm-db-cluster -n kcm-database`
- **Resolution**: Check disk I/O on standby node or network bandwidth.
