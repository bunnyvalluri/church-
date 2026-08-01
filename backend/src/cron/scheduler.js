/**
 * backend/src/cron/scheduler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron Scheduler for Autonomous Loop Architecture.
 * Periodically triggers:
 * - Security Scan (Every 5 minutes)
 * - Upload Verification (Hourly)
 * - Deployment Health Probe (Every 15 minutes)
 * - Database Audit (Every 6 hours)
 * - Branch Compliance Audit (Every 6 hours)
 * - Notification Retry Worker (Every 15 minutes)  ← NEW
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { runSecurityAuditScan } = require('../loops/securityLoop');
const { runUploadVerificationLoop } = require('../loops/uploadVerificationLoop');
const { runDeploymentHealthLoop } = require('../loops/deploymentHealthLoop');
const { runDatabaseAuditLoop } = require('../loops/databaseAuditLoop');
const { auditBranchComplianceLoop } = require('../loops/branchLoop');
const { runNotificationRetryWorker } = require('./notificationRetryWorker');

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

  // 2. Upload Verification Routine (Every 60 minutes)
  setInterval(async () => {
    try {
      await runUploadVerificationLoop();
    } catch (err) {
      console.warn(`[CRON] Upload verification interval note: ${err.message}`);
    }
  }, 60 * 60 * 1000);

  // 3. Deployment Health Routine (Every 15 minutes)
  setInterval(async () => {
    try {
      await runDeploymentHealthLoop(io);
    } catch (err) {
      console.warn(`[CRON] Deployment health interval note: ${err.message}`);
    }
  }, 15 * 60 * 1000);

  // 4. Database Audit Routine (Every 6 hours)
  setInterval(async () => {
    try {
      await runDatabaseAuditLoop();
    } catch (err) {
      console.warn(`[CRON] Database audit interval note: ${err.message}`);
    }
  }, 6 * 60 * 60 * 1000);

  // 5. Branch Audit Routine (Every 6 hours)
  setInterval(async () => {
    try {
      await auditBranchComplianceLoop(io);
    } catch (err) {
      console.warn(`[CRON] Branch audit interval note: ${err.message}`);
    }
  }, 6 * 60 * 60 * 1000);

  // 6. Notification Retry Worker (Every 15 minutes) — retries failed Email/SMS/WhatsApp
  setInterval(async () => {
    try {
      const summary = await runNotificationRetryWorker();
      if (summary.processed > 0) {
        console.log('[CRON] Notification retry run:', summary);
      }
    } catch (err) {
      console.warn(`[CRON] Notification retry interval note: ${err.message}`);
    }
  }, 15 * 60 * 1000);

  // Initial startup diagnostic sweep after 10 seconds
  setTimeout(() => {
    runSecurityAuditScan().catch(() => {});
    runUploadVerificationLoop().catch(() => {});
    runDeploymentHealthLoop(io).catch(() => {});
    runDatabaseAuditLoop().catch(() => {});
    auditBranchComplianceLoop(io).catch(() => {});
    // Run notification retry on startup to process any jobs that survived a restart
    runNotificationRetryWorker().catch(() => {});
  }, 10000);

  console.log('[CRON_SCHEDULER] Loop Cron Scheduler operational across all 8 loops (incl. Notification Retry).');
}

module.exports = {
  startLoopCronScheduler,
};
