/**
 * backend/src/infrastructure/mongodb/indexes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend index reconciliation for MongoDB Atlas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { getMongoDb } = require('./client');

const MONGODB_COLLECTIONS = {
  ACTIVITY_LOGS: 'activity_logs',
  AUDIT_EVENTS: 'audit_events',
  NOTIFICATION_EVENTS: 'notification_events',
  SYSTEM_EVENTS: 'system_events',
  ANALYTICS_EVENTS: 'analytics_events',
};

async function initializeMongoIndexes(passedDb) {
  const db = passedDb || (await getMongoDb());
  if (!db) {
    return { success: false, reason: 'MongoDB is offline or not configured' };
  }

  const indexed = [];
  const errors = [];

  try {
    const actCol = db.collection(MONGODB_COLLECTIONS.ACTIVITY_LOGS);
    await actCol.createIndex({ actorId: 1, createdAt: -1 });
    await actCol.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
    await actCol.createIndex({ createdAt: -1 });
    await actCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
    indexed.push(MONGODB_COLLECTIONS.ACTIVITY_LOGS);
  } catch (err) {
    errors.push(`activity_logs: ${err.message}`);
  }

  try {
    const auditCol = db.collection(MONGODB_COLLECTIONS.AUDIT_EVENTS);
    await auditCol.createIndex({ eventId: 1 }, { unique: true, sparse: true });
    await auditCol.createIndex({ actorId: 1, createdAt: -1 });
    await auditCol.createIndex({ resource: 1, resourceId: 1, createdAt: -1 });
    await auditCol.createIndex({ createdAt: -1 });
    indexed.push(MONGODB_COLLECTIONS.AUDIT_EVENTS);
  } catch (err) {
    errors.push(`audit_events: ${err.message}`);
  }

  try {
    const notifCol = db.collection(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS);
    await notifCol.createIndex({ eventId: 1 }, { unique: true, sparse: true });
    await notifCol.createIndex({ recipientId: 1, status: 1, createdAt: -1 });
    await notifCol.createIndex({ status: 1, attempts: 1, createdAt: 1 });
    await notifCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
    indexed.push(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS);
  } catch (err) {
    errors.push(`notification_events: ${err.message}`);
  }

  try {
    const sysCol = db.collection(MONGODB_COLLECTIONS.SYSTEM_EVENTS);
    await sysCol.createIndex({ eventId: 1 }, { unique: true, sparse: true });
    await sysCol.createIndex({ eventType: 1, aggregateId: 1, createdAt: -1 });
    await sysCol.createIndex({ correlationId: 1 });
    indexed.push(MONGODB_COLLECTIONS.SYSTEM_EVENTS);
  } catch (err) {
    errors.push(`system_events: ${err.message}`);
  }

  try {
    const analyticsCol = db.collection(MONGODB_COLLECTIONS.ANALYTICS_EVENTS);
    await analyticsCol.createIndex({ eventName: 1, timestamp: -1 });
    await analyticsCol.createIndex({ userId: 1, timestamp: -1 });
    await analyticsCol.createIndex({ timestamp: 1 }, { expireAfterSeconds: 15552000 });
    indexed.push(MONGODB_COLLECTIONS.ANALYTICS_EVENTS);
  } catch (err) {
    errors.push(`analytics_events: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    indexed,
    errors,
  };
}

module.exports = {
  MONGODB_COLLECTIONS,
  initializeMongoIndexes,
};
