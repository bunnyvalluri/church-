# KCM Database Backup & Disaster Recovery Architecture

## 1. Backup Strategy Overview
The production database uses multi-layered backup redundancy:

1. **Neon Continuous Point-in-Time Recovery (PITR)**:
   - **Retention**: 7 days of continuous Write-Ahead Log (WAL) archiving.
   - **Granularity**: Second-level recovery capability to any point in the past 7 days.
   - **RPO (Recovery Point Objective)**: < 15 minutes.
   - **RTO (Recovery Time Objective)**: < 30 minutes.

2. **Daily Logical Snapshots (pg_dump & S3/Velero)**:
   - **Schedule**: Nightly at 02:00 IST via automated backup cron job.
   - **Encryption**: AES-256 server-side encryption at rest.
   - **Retention**: 30 daily snapshots, 12 monthly archives for financial compliance.

## 2. Safe Restore Verification Procedure
> [!IMPORTANT]
> Never restore directly into a live production branch. Always restore to a temporary recovery branch or staging instance to verify data integrity before promoting.

### Step-by-Step Restoration
1. **Provision Temporary Recovery Branch**:
   ```bash
   neon branches create --project-id kcm-prod --name restore-test --parent main
   ```
2. **Apply PITR Restore Timestamp**:
   ```bash
   neon branches restore --project-id kcm-prod --branch restore-test --timestamp "2026-09-26T12:00:00Z"
   ```
3. **Verify Critical Tables & Counts**:
   ```sql
   SELECT count(*) FROM members;
   SELECT count(*) FROM donations WHERE status = 'COMPLETED';
   SELECT count(*) FROM receipts;
   ```
4. **Health Check Execution**:
   Run the full health check suite against the restored database endpoint to confirm schema and relational parity.
