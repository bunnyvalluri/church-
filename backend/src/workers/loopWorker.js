/**
 * backend/src/workers/loopWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Background Loop Worker.
 * Binds processors to BullMQ / In-Memory queues for all 7 automated loops.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { registerWorker } = require('../queues/queueManager');
const { processEventUploadLoop } = require('../loops/eventUploadLoop');
const { runSecurityAuditScan } = require('../loops/securityLoop');
const { auditBranchComplianceLoop } = require('../loops/branchLoop');
const { processNotificationLoop } = require('../loops/notificationLoop');
const { reconcileOfflineBatch } = require('../loops/offlineSyncHandler');
const { processDonationWebhookLoop } = require('../loops/donationLoop');

function initLoopWorkers(io) {
  console.log('[WORKER_ENGINE] Initializing unified Loop Workers...');

  // 1. Event Upload Loop Worker
  registerWorker('eventUpload', async (job) => {
    return await processEventUploadLoop(job.data, io);
  });

  // 2. Security Loop Worker
  registerWorker('securityAudit', async (job) => {
    return await runSecurityAuditScan();
  });

  // 3. Branch Audit Loop Worker
  registerWorker('branchAudit', async (job) => {
    return await auditBranchComplianceLoop(io);
  });

  // 4. Notification Loop Worker
  registerWorker('notification', async (job) => {
    return await processNotificationLoop(job.data, io);
  });

  // 5. Offline Sync Loop Worker
  registerWorker('offlineSync', async (job) => {
    return await reconcileOfflineBatch(job.data.batch);
  });

  // 6. Donation Loop Worker
  registerWorker('donation', async (job) => {
    const { rawBody, signature } = job.data;
    return await processDonationWebhookLoop(rawBody, signature, io);
  });

  console.log('[WORKER_ENGINE] All Loop Workers successfully bound and listening.');
}

module.exports = {
  initLoopWorkers,
};
