# Runbook: Backup Verification & Database Restore Procedure

## 1. Scope & Objective
This runbook provides the step-by-step procedure to execute an emergency database restore from Neon continuous WAL snapshots or CloudNativePG S3 backups.

## 2. Pre-Restore Safety Checks
1. Ensure restore operations are conducted on an isolated branch or staging database first before promoting to production.
2. Record current database state snapshot:
   ```bash
   neon branches create --name pre-restore-safety-snapshot --parent main
   ```

## 3. Execution Steps
1. **Identify Target Timestamp**:
   Identify the point-in-time timestamp (e.g. `2026-09-26T12:00:00Z`).
2. **Execute Point-In-Time Branch Creation**:
   ```bash
   neon branches create --name pitr-recovery-branch --parent main --timestamp "2026-09-26T12:00:00Z"
   ```
3. **Verify Schema & Data Consistency**:
   - Query user counts, donation records, and event schedules on the recovery branch.
4. **Promote Recovered Branch**:
   - Update `DATABASE_URL` in Kubernetes Secret / Vercel Environment Variables.
   - Restart backend pods to acquire new connection pool:
     ```bash
     kubectl rollout restart deployment/kcm-backend-api -n kcm-system
     kubectl rollout restart deployment/kcm-frontend -n kcm-system
     ```

## 4. Post-Restore Verification
- Run `/api/health` and verify database returns `healthy`.
- Execute automated smoke tests across login, events, and donation viewing.
