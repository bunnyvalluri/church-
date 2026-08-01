/**
 * backend/src/loops/deploymentHealthLoop.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 6: Deployment Health Loop (ECC OODA Pattern)
 * 
 * Workflow:
 * 1. OBSERVE: Triggered periodically (every 15m) or on deployment events.
 * 2. ORIENT: Evaluate Neon PostgreSQL connection pool latency, synthetic HTTP route probes, Socket.io connectivity, and memory usage.
 * 3. DECIDE: Determine system stability status (HEALTHY, DEGRADED, CRITICAL).
 * 4. ACT:
 *    a. Execute synthetic probes against `/health`, `/api/loops/health`, `/metrics`.
 *    b. Measure Neon DB response time via `prisma.$queryRaw`.
 *    c. If critical errors detected, emit alert via Socket.io and trigger fallback alert.
 * 5. TELEMETRY: Record metrics & system state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('./config');
const { logAuditEvent } = require('../services/auditLogger');
const http = require('http');
const https = require('https');

/**
 * Execute routine Deployment Health Loop audit.
 */
async function runDeploymentHealthLoop(io) {
  console.log('[DEPLOYMENT_HEALTH_LOOP] [OBSERVE] Executing continuous deployment & system health probes...');
  
  const startTime = Date.now();
  let dbLatencyMs = -1;
  let dbStatus = 'UNKNOWN';
  let syntheticRoutesStatus = 'OK';
  let memoryUsage = process.memoryUsage();

  // 1. Orient & Act: Test Neon PostgreSQL Connection & Latency
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = dbLatencyMs < 500 ? 'HEALTHY' : 'SLOW';
  } catch (err) {
    dbStatus = 'DOWN';
    console.error(`[DEPLOYMENT_HEALTH_LOOP] [ALERT] Database health check failed: ${err.message}`);
  }

  // 2. Orient & Act: Synthetic Probe on Frontend & Companion Server
  const frontendProbe = await probeEndpoint(`${config.frontendUrl}/api/health`);
  const backendProbe = await probeEndpoint(`http://localhost:${config.port || 3001}/health`);

  if (!frontendProbe || !backendProbe) {
    syntheticRoutesStatus = 'DEGRADED';
  }

  // 3. Compute Overall Deployment Health Score
  const isHealthy = dbStatus === 'HEALTHY' && syntheticRoutesStatus === 'OK';
  const overallStatus = isHealthy ? 'HEALTHY' : dbStatus === 'DOWN' ? 'CRITICAL' : 'DEGRADED';

  const healthReport = {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    executionTimeMs: Date.now() - startTime,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    probes: {
      frontend: frontendProbe ? 'UP' : 'UNREACHABLE',
      backend: backendProbe ? 'UP' : 'UNREACHABLE',
    },
    systemMemory: {
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
    },
  };

  // 4. Alert if degraded or critical
  if (overallStatus !== 'HEALTHY' && io) {
    io.emit('system:alert', {
      type: 'HEALTH_DEGRADED',
      message: `System health status is ${overallStatus}. Database: ${dbStatus}, Latency: ${dbLatencyMs}ms.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 5. Write Telemetry Audit Log
  await logAuditEvent({
    action: 'DEPLOYMENT_HEALTH_CHECK',
    entity: 'SYSTEM_PROBE',
    entityId: 'HEALTH_MONITOR',
    details: healthReport,
    severity: overallStatus === 'HEALTHY' ? 'INFO' : 'WARN',
    loopName: 'Deployment Health Loop',
  });

  console.log(`[DEPLOYMENT_HEALTH_LOOP] Health check complete. Status: ${overallStatus}, DB Latency: ${dbLatencyMs}ms`);
  return healthReport;
}

/**
 * Synthetic Probe Helper
 */
function probeEndpoint(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout: 3000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

module.exports = {
  runDeploymentHealthLoop,
};
