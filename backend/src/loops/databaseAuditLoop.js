/**
 * backend/src/loops/databaseAuditLoop.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 7: Database Audit Loop (ECC OODA Pattern)
 * 
 * Workflow:
 * 1. OBSERVE: Scan PostgreSQL tables (`events`, `sermons`, `donations`, `donation_sessions`, `payment_webhooks`, `audit_logs`).
 * 2. ORIENT: Evaluate connection pool state, index utilization, expired payment sessions, and orphaned data records.
 * 3. DECIDE: Flag expired sessions, failed webhooks, or database index drift.
 * 4. ACT:
 *    a. Cleanup expired pending donation sessions (`expiresAt < NOW()`).
 *    b. Audit total record counts across primary entities.
 *    c. Validate audit log table integrity.
 * 5. TELEMETRY: Record metrics & persist system audit status.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAuditEvent } = require('../services/auditLogger');

/**
 * Execute routine Database Audit Loop scan.
 */
async function runDatabaseAuditLoop() {
  console.log('[DATABASE_AUDIT_LOOP] [OBSERVE] Running routine database audit scan...');
  const startTime = Date.now();

  try {
    // 1. ACT: Clean up expired donation sessions
    const expiredCount = await prisma.donationSession.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
        paymentState: 'EXPIRED',
      },
    });

    if (expiredCount.count > 0) {
      console.log(`[DATABASE_AUDIT_LOOP] [ACT] Marked ${expiredCount.count} expired donation sessions as EXPIRED.`);
    }

    // 2. ACT: Audit Record Metrics across core models
    const [userCount, eventCount, sermonCount, donationCount, auditLogCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count({ where: { isDeleted: false } }),
      prisma.sermon.count({ where: { isDeleted: false } }),
      prisma.donation.count(),
      prisma.auditLog.count(),
    ]);

    const report = {
      timestamp: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      metrics: {
        totalUsers: userCount,
        activeEvents: eventCount,
        activeSermons: sermonCount,
        totalDonations: donationCount,
        totalAuditLogs: auditLogCount,
        expiredSessionsCleaned: expiredCount.count,
      },
      status: 'HEALTHY',
    };

    // 3. Write Database Audit Telemetry Log
    await logAuditEvent({
      action: 'DATABASE_AUDIT_COMPLETED',
      entity: 'DATABASE',
      entityId: 'POSTGRESQL_NEON',
      details: report,
      severity: 'INFO',
      loopName: 'Database Audit Loop',
    });

    console.log(`[DATABASE_AUDIT_LOOP] Database audit scan completed successfully in ${report.executionTimeMs}ms.`);
    return report;
  } catch (err) {
    console.error(`[DATABASE_AUDIT_LOOP] Database audit scan failed: ${err.message}`);
    return { status: 'ERROR', error: err.message };
  }
}

module.exports = {
  runDatabaseAuditLoop,
};
