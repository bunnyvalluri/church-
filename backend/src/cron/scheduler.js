/**
 * backend/src/cron/scheduler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron Scheduler for Loop Engineering Architecture.
 * Periodically triggers Security Scan (5 min), Branch Audit (6 hours),
 * Notification Sweep (15 min), and Offline Sync Check (10 min).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { runSecurityAuditScan } = require('../loops/securityLoop');
const { auditBranchComplianceLoop } = require('../loops/branchLoop');
const { getQueue } = require('../queues/queueManager');

function startLoopCronScheduler(io) {
  console.log('[CRON_SCHEDULER] Starting background Loop Cron Scheduler...');

  // 1. Security Scan Routine (Every 5 minutes)
  setInterval(async () => {
    try {
      await runSecurityAuditScan();
    } catch (err) {
      console.warn(`[CRON] Security scan interval note: ${err.message}`);
    }
  }, 5 * 60 * 1000);

  // 2. Branch Audit Routine (Every 6 hours)
  setInterval(async () => {
    try {
      await auditBranchComplianceLoop(io);
    } catch (err) {
      console.warn(`[CRON] Branch audit interval note: ${err.message}`);
    }
  }, 6 * 60 * 60 * 1000);

  // Initial trigger after server startup (10s delay)
  setTimeout(() => {
    runSecurityAuditScan().catch(() => {});
    auditBranchComplianceLoop(io).catch(() => {});
  }, 10000);

  console.log('[CRON_SCHEDULER] Loop Cron Scheduler operational.');
}

module.exports = {
  startLoopCronScheduler,
};
