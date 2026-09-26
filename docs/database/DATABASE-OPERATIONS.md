# KCM Database Operations & Maintenance Runbook

## 1. Routine Maintenance Tasks

### 1.1 Connection Pool Monitoring
- Monitor Neon connection pool utilization. If connection count approaches 80% of pool capacity, scale compute endpoints or tune `connection_limit` parameters in connection strings.

### 1.2 Table Bloat & Vacuuming
- Neon PostgreSQL automatically manages autovacuum workers. For high-churn tables (`sessions`, `notification_logs`, `payment_webhooks`), ensure autovacuum vacuum scale factor is set to 0.05.

### 1.3 Slow Query Identification
- In development/staging, query execution times exceeding 200ms are flagged by the Health System.
- In production, utilize Neon's built-in query statistics (`pg_stat_statements`) to detect queries needing composite indexing.

## 2. Emergency Operational Commands

### 2.1 Kill Hanging Serverless Transactions
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

### 2.2 Verify Database Connectivity (Health Probe)
```bash
node -e "const { PrismaClient } = require('./frontend/prisma/generated/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT 1\`.then(() => console.log('DB Healthy')).catch(console.error).finally(() => p.\$disconnect());"
```
