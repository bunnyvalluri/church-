/**
 * backend/src/modules/mongodb/services/eventPublisher.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend Event Publisher for Loop Engine & Background Services.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const crypto = require('crypto');
const { insertSystemEvent } = require('../repositories/systemEventRepository');
const { insertActivityLog } = require('../repositories/activityLogRepository');

async function publishBackendEvent(event, io) {
  const eventId = event.eventId || `sys_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const correlationId = event.correlationId || `corr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const source = event.source || 'kcm-companion-server';

  // 1. Ingest to MongoDB
  const mongoRes = await insertSystemEvent({
    eventId,
    eventType: event.eventType,
    aggregateType: event.aggregateType || 'System',
    aggregateId: event.aggregateId || 'kcm-backend',
    payload: event.payload || {},
    source,
    correlationId,
  });

  // 2. Activity log if actor is specified
  if (event.actorId) {
    insertActivityLog({
      actorId: event.actorId,
      actorRole: event.actorRole || 'SYSTEM',
      action: event.eventType.toUpperCase().replace(/\./g, '_'),
      entityType: (event.aggregateType || 'system').toLowerCase(),
      entityId: event.aggregateId || 'unknown',
      metadata: event.payload || {},
    }).catch(() => {});
  }

  // 3. Socket broadcast if io instance is present
  if (io && event.broadcastSocket !== false) {
    try {
      if (event.socketRoom) {
        io.to(event.socketRoom).emit(event.eventType, event.payload);
      } else {
        io.emit(event.eventType, event.payload);
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    eventId,
    persisted: mongoRes.inserted,
  };
}

module.exports = {
  publishBackendEvent,
};
