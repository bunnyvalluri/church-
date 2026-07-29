# Volume Snapshots Architecture & Policies

## Snapshot Mechanics
Longhorn uses copy-on-write differential snapshot chains stored locally alongside volume replicas. Snapshots allow instantaneous point-in-time recovery without performance degradation during normal operations.

---

## Recurring Snapshot Schedules (`RecurringJob`)

1. **Hourly Database Snapshots (`hourly-database-snapshot`)**:
   - Target: Volumes tagged with `database` (CloudNativePG, PgBouncer).
   - Cron: `0 * * * *` (Every hour).
   - Retention: Keep last 24 snapshots.

2. **Daily Cluster Snapshots (`daily-system-snapshot`)**:
   - Target: All volumes (`default` group).
   - Cron: `0 2 * * *` (Daily at 02:00 AM UTC).
   - Retention: Keep last 14 snapshots.

---

## Snapshot Cleanup & System Automation
- Longhorn automatically purges outdated snapshots outside retention windows.
- Deleted snapshot blocks are consolidated during background system trim operations (`autoCleanupSystemGeneratedSnapshot: true`).
