# Automated Rollback Engine & Anomaly Detection

## 1. Rollback Decision Framework

Rollback is automatically initiated when all the following conditions are met:
1. A new deployment has been promoted to production.
2. The observation window starts (`ROLLBACK_OBSERVATION_WINDOW = 30s`).
3. Monitoring detects a critical sustained anomaly across 3 consecutive cycles:
   - 5xx error rate exceeds threshold (`ROLLBACK_5XX_RATE = 10%`).
   - Average request latency exceeds threshold (`ROLLBACK_LATENCY_THRESHOLD = 3500ms`).
   - Critical health probes (`/api/health`, `/api/health/live`, `/api/health/ready`) persistently fail.
4. The previous healthy deployment is identified via deployment registry metadata.
5. The rollback lock threshold (`MAX_AUTOMATIC_ROLLBACKS = 2`) is not exceeded.

---

## 2. Database Migration Safety & Rollback Compatibility

> [!CAUTION]
> Application rollback does NOT automatically revert database schema migrations.

### Safety Rules:
1. **Expand-and-Contract Pattern**: All schema changes must be backward-compatible (e.g. add new nullable columns first, deploy new code, then deprecate old columns in a separate milestone).
2. **Zero Destructive Migrations in Rollback Windows**: Dropping columns or renaming tables during normal deployment releases is strictly prohibited.
3. **Pre-Migration Verification**: The migration engine asserts compatibility before applying changes.
