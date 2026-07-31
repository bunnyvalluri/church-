/**
 * backend/src/loops/offlineSyncHandler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 6: Server-Side Offline Sync Handler
 * Ingests batch -> Replay attack validation -> PostgreSQL commit -> Duplicate resolution.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAuditEvent } = require('../services/auditLogger');

// Cache of processed nonces to prevent replay attacks
const processedNonceCache = new Set();

/**
 * Reconcile offline sync batch sent from client.
 */
async function reconcileOfflineBatch(batch = []) {
  console.log(`[OFFLINE_SYNC_HANDLER] [OBSERVE] Reconciling ${batch.length} offline records...`);
  const processedNonces = [];
  const errors = [];

  for (const item of batch) {
    const { id: nonce, type, payload, clientTimestamp } = item;

    // 1. ORIENT: Replay Attack Check (Nonce Validation)
    if (processedNonceCache.has(nonce)) {
      console.warn(`[OFFLINE_SYNC_HANDLER] [REPLAY_PREVENTED] Nonce ${nonce} already processed. Skipping duplicate.`);
      processedNonces.push(nonce); // Mark processed to clear client
      continue;
    }

    try {
      // 2. ACT: Process item according to type
      if (type === 'ATTENDANCE' && prisma.eventAttendance) {
        await prisma.eventAttendance.create({
          data: {
            eventId: payload.eventId,
            userId: payload.userId || null,
            branchId: payload.branchId || null,
            status: payload.status || 'PRESENT',
            notes: `Offline Sync (Recorded: ${clientTimestamp})`,
          },
        });
      } else if (type === 'PRAYER_REQUEST' && prisma.prayerRequest) {
        await prisma.prayerRequest.create({
          data: {
            name: payload.name || 'Anonymous',
            email: payload.email || null,
            request: payload.request,
            category: payload.category || 'General',
            status: 'PENDING',
          },
        });
      }

      // Mark nonce as processed
      processedNonceCache.add(nonce);
      processedNonces.push(nonce);
    } catch (err) {
      console.error(`[OFFLINE_SYNC_HANDLER] Error processing nonce ${nonce}: ${err.message}`);
      errors.push({ nonce, error: err.message });
    }
  }

  await logAuditEvent({
    action: 'OFFLINE_SYNC_BATCH_RECONCILED',
    entity: 'OFFLINE_SYNC',
    entityId: `batch_${Date.now()}`,
    details: { totalReceived: batch.length, processedCount: processedNonces.length, errorCount: errors.length },
    severity: 'INFO',
    loopName: 'Offline Sync Loop',
  });

  return { processedNonces, errors };
}

module.exports = {
  reconcileOfflineBatch,
};
