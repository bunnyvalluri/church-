/**
 * backend/src/services/auditLogger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Structured Audit Logger for Loop Engineering Architecture.
 * Writes audit entries to PostgreSQL via Prisma and updates STATE.md file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STATE_FILE_PATH = path.join(__dirname, '../../../STATE.md');

/**
 * Record audit event in PostgreSQL AuditLog table and refresh telemetry.
 */
async function logAuditEvent({ action, entity, entityId, userId, details, severity = 'INFO', loopName = 'SYSTEM' }) {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT:${severity}] [${loopName}] ${action} - ${JSON.stringify(details || {})}`);

  try {
    // 1. Write to PostgreSQL AuditLog if Prisma model exists
    if (prisma.auditLog) {
      await prisma.auditLog.create({
        data: {
          action: `${loopName}:${action}`,
          userId: userId || null,
          details: JSON.stringify({ entity, entityId, details: details || {} }),
          createdAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.warn(`[AUDIT_LOGGER_WARN] Database write skipped: ${err.message}`);
  }

  // 2. Mirror to MongoDB Atlas audit_events
  try {
    const { insertAuditEvent } = require('../modules/mongodb/repositories/auditEventRepository');
    const crypto = require('crypto');
    const eventId = `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    insertAuditEvent({
      eventId,
      actorId: userId || 'SYSTEM',
      actorRole: 'SYSTEM',
      action: `${loopName}:${action}`,
      resource: entity || 'system_loop',
      resourceId: entityId || 'unknown',
      metadata: { severity, loopName, ...(details || {}) },
    }).catch(() => {});
  } catch (mongoErr) {
    // Non-blocking
  }

  // 3. Update STATE.md reconciliation timestamp asynchronously
  updateStateTelemetry(loopName, severity);
}

/**
 * Increment state counters or update timestamp in STATE.md
 */
function updateStateTelemetry(loopName, severity) {
  try {
    if (!fs.existsSync(STATE_FILE_PATH)) return;

    let content = fs.readFileSync(STATE_FILE_PATH, 'utf8');
    const nowISO = new Date().toISOString();

    // Update Last State Reconciliation line
    content = content.replace(
      /> \*\*Last State Reconciliation\*\*: .*/,
      `> **Last State Reconciliation**: ${nowISO}`
    );

    fs.writeFileSync(STATE_FILE_PATH, content, 'utf8');
  } catch (err) {
    // Non-blocking telemetry warning
  }
}

module.exports = {
  logAuditEvent,
  updateStateTelemetry,
};
