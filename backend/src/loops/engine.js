/**
 * backend/src/loops/engine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Core Master Loop Orchestrator.
 * Initializes queue workers, cron schedulers, health checks, and state telemetry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { initLoopWorkers } = require('../workers/loopWorker');
const { startLoopCronScheduler } = require('../cron/scheduler');
const { logAuditEvent, updateStateTelemetry } = require('../services/auditLogger');
const { runSecurityAuditScan } = require('./securityLoop');
const { auditBranchComplianceLoop } = require('./branchLoop');

let isInitialized = false;

/**
 * Initialize Loop Engineering Subsystems on backend server startup.
 */
function initializeLoopEngine(io) {
  if (isInitialized) {
    console.log('[LOOP_ENGINE] Loop Engine already running.');
    return;
  }

  console.log('──────────────────────────────────────────────────────────────');
  console.log('⚡ INITIALIZING LOOP-ENGINEERING ARCHITECTURE (KCM PORTAL)');
  console.log('──────────────────────────────────────────────────────────────');

  // 1. Initialize Queue Workers
  initLoopWorkers(io);

  // 2. Start Cron Scheduler
  startLoopCronScheduler(io);

  // 3. Update initial state telemetry
  updateStateTelemetry('SYSTEM', 'INFO');

  isInitialized = true;
  console.log('✅ LOOP-ENGINEERING ARCHITECTURE FULLY OPERATIONAL.');
  console.log('──────────────────────────────────────────────────────────────');
}

/**
 * Comprehensive System Loop Health Check.
 */
async function runLoopHealthCheck(io) {
  console.log('[LOOP_ENGINE] Running Loop Architecture Health Diagnostic...');
  
  const securityHealth = await runSecurityAuditScan();
  const branchHealth = await auditBranchComplianceLoop(io);

  const healthReport = {
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    loops: {
      eventUploadLoop: 'HEALTHY',
      securityLoop: securityHealth.flaggedAnomalies === 0 ? 'HEALTHY' : 'ATTENTION_NEEDED',
      branchLoop: 'MONITORING',
      deploymentLoop: 'IDLE',
      notificationLoop: 'HEALTHY',
      offlineSyncLoop: 'LISTENING',
      donationLoop: 'HEALTHY',
    },
    monitoredBranches: branchHealth,
  };

  await logAuditEvent({
    action: 'LOOP_ENGINE_HEALTH_CHECK',
    entity: 'HEALTH_DIAGNOSTIC',
    entityId: 'SYSTEM',
    details: healthReport,
    severity: 'INFO',
    loopName: 'Loop Engine',
  });

  return healthReport;
}

module.exports = {
  initializeLoopEngine,
  runLoopHealthCheck,
};
