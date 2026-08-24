/**
 * backend/src/modules/mongodb/repositories/auditEventRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend repository for audit_events with idempotency.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { ObjectId } = require('mongodb');
const { getMongoDb } = require('../../../infrastructure/mongodb/client');
const { MONGODB_COLLECTIONS } = require('../../../infrastructure/mongodb/indexes');

async function insertAuditEvent(event) {
  const db = await getMongoDb();
  if (!db) return { inserted: false };

  try {
    const doc = {
      ...event,
      createdAt: event.createdAt || new Date(),
    };

    const res = await db.collection(MONGODB_COLLECTIONS.AUDIT_EVENTS).updateOne(
      { eventId: event.eventId },
      { $setOnInsert: doc },
      { upsert: true }
    );

    return {
      inserted: res.upsertedCount > 0,
      id: res.upsertedId ? res.upsertedId.toString() : undefined,
    };
  } catch (err) {
    if (err.code === 11000) return { inserted: false };
    console.warn(`[AUDIT_REPO_BACKEND] Insert failed: ${err.message}`);
    return { inserted: false };
  }
}

async function findAuditEvents(options = {}) {
  const db = await getMongoDb();
  if (!db) return { data: [], nextCursor: null, hasMore: false };

  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const filter = {};

  if (options.actorId) filter.actorId = options.actorId;
  if (options.resource) filter.resource = options.resource;
  if (options.resourceId) filter.resourceId = options.resourceId;
  if (options.action) filter.action = options.action;

  if (options.cursor) {
    try {
      const cursorDate = new Date(options.cursor);
      if (!isNaN(cursorDate.getTime())) {
        filter.createdAt = { $lt: cursorDate };
      }
    } catch {
      // ignore
    }
  }

  try {
    const raw = await db
      .collection(MONGODB_COLLECTIONS.AUDIT_EVENTS)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = raw.length > limit;
    const data = hasMore ? raw.slice(0, limit) : raw;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].createdAt.toISOString() : null;

    return { data, nextCursor, hasMore };
  } catch (err) {
    console.error(`[AUDIT_REPO_BACKEND] Query error: ${err.message}`);
    return { data: [], nextCursor: null, hasMore: false };
  }
}

module.exports = {
  insertAuditEvent,
  findAuditEvents,
};
