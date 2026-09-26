# Runbook: Database Outage & Connection Pool Recovery

## 1. Symptoms & Trigger Conditions
- Alert: `DatabaseConnectionFailure` or `PostgreSQLHighQueryDuration`.
- Health endpoint `/api/health` reports `"database": "unhealthy"`.

## 2. Immediate Diagnostic Actions
1. **Check Neon Cloud Console Status**:
   - Verify Neon project status, compute state, and connection limits.
2. **Inspect Prisma Connection Exhaustion**:
   - Check active database connections in Neon Metrics.
3. **Verify Local CloudNativePG Cluster (if running in-cluster)**:
   ```bash
   kubectl get cluster -n kcm-system
   kubectl describe cluster kcm-db -n kcm-system
   ```

## 3. Containment & Remediation
- **Scenario A: Neon Compute Suspended (Cold Start Delay)**:
  Wake compute via direct probe:
  ```bash
  curl -I https://kcmchurch.vercel.app/api/health
  ```
- **Scenario B: Connection Pool Exhaustion**:
  Ensure PgBouncer connection string (`?sslmode=require&pgbouncer=true`) is active in `DATABASE_URL`.
- **Scenario C: Database Corruption / Hardware Fault**:
  Trigger Point-In-Time Restore (PITR) to a clean snapshot branch in Neon, then update the `DATABASE_URL` secret.

## 4. Verification
- Confirm Prisma queries resolve on `/api/events` and `/api/sermons`.
