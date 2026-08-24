/**
 * backend/src/modules/mongodb/repositories/activityLogRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend repository for activity_logs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { ObjectId } = require('mongodb');
const { getMongoDb } = require('../../../infrastructure/mongodb/client');
const { MONGODB_COLLECTIONS } = require('../../../infrastructure/mongodb/indexes');

async function insertActivityLog(log) {
  const db = await getMongoDb();
  if (!db) return null;

  try {
    const doc = {
      ...log,
      createdAt: log.createdAt || new Date(),
    };
    const res = await db.collection(MONGODB_COLLECTIONS.ACTIVITY_LOGS).insertOne(doc);
    return res.insertedId.toString();
  } catch (err) {
    console.warn(`[ACTIVITY_REPO_BACKEND] Insert failed: ${err.message}`);
    return null;
  }
}

async function findActivityLogs(options = {}) {
  const db = await getMongoDb();
  if (!db) return { data: [], nextCursor: null, hasMore: false };

  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const filter = {};

  if (options.actorId) filter.actorId = options.actorId;
  if (options.entityType) filter.entityType = options.entityType;
  if (options.entityId) filter.entityId = options.entityId;

  if (options.cursor) {
    try {
      const cursorDate = new Date(options.cursor);
      if (!isNaN(cursorDate.getTime())) {
        filter.createdAt = { $lt: cursorDate };
      } else if (ObjectId.isValid(options.cursor)) {
        filter._id = { $lt: new ObjectId(options.cursor) };
      }
    } catch {
      // ignore
    }
  }

  try {
    const raw = await db
      .collection(MONGODB_COLLECTIONS.ACTIVITY_LOGS)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = raw.length > limit;
    const data = hasMore ? raw.slice(0, limit) : raw;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].createdAt.toISOString() : null;

    return { data, nextCursor, hasMore };
  } catch (err) {
    console.error(`[ACTIVITY_REPO_BACKEND] Query error: ${err.message}`);
    return { data: [], nextCursor: null, hasMore: false };
  }
}

module.exports = {
  insertActivityLog,
  findActivityLogs,
};
