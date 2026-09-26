# Runbook: Offline Sync & IndexedDB Conflict Remediation

## 1. Symptoms & Trigger Conditions
- Alert: `OfflineSyncFailureRateSpike` or `IndexedDBSyncTimeout`.
- Branch pastors or volunteers report local attendance or prayer requests are not syncing when re-connecting to WiFi.

## 2. Immediate Diagnostic Actions
1. **Inspect Offline Batch Sync Route**:
   ```bash
   kubectl logs -n kcm-system -l app=kcm-backend-api | grep "/api/sync/offline"
   ```
2. **Check Idempotency Nonce Collisions**:
   - Verify server-side nonce logs in PostgreSQL `AuditLog`.

## 3. Containment & Remediation
- **Scenario A: Network Timeout During Batch Sync**:
  Client-side sync engine implements exponential backoff with jitter (initial 3s, max 45s) and retains unconfirmed transactions in IndexedDB (`kcm_offline_store`).
- **Scenario B: Conflict Resolution**:
  Server timestamp takes authority. Non-conflicting fields are merged, and any schema validation rejections are returned with granular error codes so the user can edit their draft without data loss.

## 4. Verification
- Verify client IndexedDB queue drains to 0 pending items upon online connection.
