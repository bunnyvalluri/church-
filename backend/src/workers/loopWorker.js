/**
 * backend/src/workers/loopWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Background Loop Worker Engine.
 * Binds processors to BullMQ / In-Memory queues for all 7 automated loops:
 * 1. Event Automation Loop
 * 2. Sermon Automation Loop
 * 3. Security Audit Loop
 * 4. Upload Verification Loop
 * 5. Notification Loop
 * 6. Deployment Health Loop
 * 7. Database Audit Loop
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { registerWorker } = require('../queues/queueManager');
const { processEventUploadLoop } = require('../loops/eventUploadLoop');
const { processSermonAutomationLoop } = require('../loops/sermonAutomationLoop');
const { runSecurityAuditScan } = require('../loops/securityLoop');
const { runUploadVerificationLoop } = require('../loops/uploadVerificationLoop');
const { processNotificationLoop } = require('../loops/notificationLoop');
const { runDeploymentHealthLoop } = require('../loops/deploymentHealthLoop');
const { runDatabaseAuditLoop } = require('../loops/databaseAuditLoop');
const { auditBranchComplianceLoop } = require('../loops/branchLoop');
const { reconcileOfflineBatch } = require('../loops/offlineSyncHandler');
const { processDonationWebhookLoop } = require('../loops/donationLoop');

function initLoopWorkers(io) {
  console.log('[WORKER_ENGINE] Initializing unified Loop Workers...');

  // 1. Event Automation Worker
  registerWorker('eventUpload', async (job) => {
    return await processEventUploadLoop(job.data, io);
  });

  // 2. Sermon Automation Worker
  registerWorker('sermonAutomation', async (job) => {
    return await processSermonAutomationLoop(job.data, io);
  });

  // 3. Security Audit Worker
  registerWorker('securityAudit', async (job) => {
    return await runSecurityAuditScan();
  });

  // 4. Upload Verification Worker
  registerWorker('uploadVerification', async (job) => {
    return await runUploadVerificationLoop();
  });

  // 5. Notification Loop Worker
  registerWorker('notification', async (job) => {
    return await processNotificationLoop(job.data, io);
  });

  // 6. Deployment Health Worker
  registerWorker('deploymentHealth', async (job) => {
    return await runDeploymentHealthLoop(io);
  });

  // 7. Database Audit Worker
  registerWorker('databaseAudit', async (job) => {
    return await runDatabaseAuditLoop();
  });

  // Auxiliary Workers: Branch, Offline Sync, Donation Webhooks
  registerWorker('branchAudit', async (job) => {
    return await auditBranchComplianceLoop(io);
  });

  registerWorker('offlineSync', async (job) => {
    return await reconcileOfflineBatch(job.data.batch);
  });

  registerWorker('donation', async (job) => {
    const { rawBody, signature } = job.data;
    return await processDonationWebhookLoop(rawBody, signature, io);
  });

  console.log('[WORKER_ENGINE] All 7 Production Loop Workers successfully bound and listening.');
}

module.exports = {
  initLoopWorkers,
};
