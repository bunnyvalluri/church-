/**
 * backend/src/modules/mongodb/repositories/notificationEventRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend repository for notification_events.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { ObjectId } = require('mongodb');
const { getMongoDb } = require('../../../infrastructure/mongodb/client');
const { MONGODB_COLLECTIONS } = require('../../../infrastructure/mongodb/indexes');

async function insertNotificationEvent(event) {
  const db = await getMongoDb();
  if (!db) return { inserted: false };

  try {
    const doc = {
      ...event,
      createdAt: event.createdAt || new Date(),
    };

    const res = await db.collection(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS).updateOne(
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
    console.warn(`[NOTIF_REPO_BACKEND] Insert failed: ${err.message}`);
    return { inserted: false };
  }
}

async function updateNotificationStatus(eventId, update) {
  const db = await getMongoDb();
  if (!db) return false;

  try {
    const setPayload = {
      status: update.status,
      processedAt: update.processedAt || new Date(),
    };
    if (update.attempts !== undefined) setPayload.attempts = update.attempts;
    if (update.provider) setPayload.provider = update.provider;
    if (update.providerMessageId) setPayload.providerMessageId = update.providerMessageId;
    if (update.error !== undefined) setPayload.error = update.error;
    if (update.deliveredAt) setPayload.deliveredAt = update.deliveredAt;

    const res = await db
      .collection(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS)
      .updateOne({ eventId }, { $set: setPayload });

    return res.modifiedCount > 0;
  } catch (err) {
    console.error(`[NOTIF_REPO_BACKEND] Update error: ${err.message}`);
    return false;
  }
}

module.exports = {
  insertNotificationEvent,
  updateNotificationStatus,
};
