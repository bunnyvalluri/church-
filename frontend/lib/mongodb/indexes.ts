/**
 * frontend/lib/mongodb/indexes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Index Provisioning for MongoDB Atlas Collections.
 * Ensures production indexes are created idempotently on startup.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Db } from "mongodb";
import { getMongoDb } from "./client";

export const MONGODB_COLLECTIONS = {
  ACTIVITY_LOGS: "activity_logs",
  AUDIT_EVENTS: "audit_events",
  NOTIFICATION_EVENTS: "notification_events",
  SYSTEM_EVENTS: "system_events",
  ANALYTICS_EVENTS: "analytics_events",
  SEARCH_DOCUMENTS: "search_documents",
  CONTENT_METADATA: "content_metadata",
  MEDIA_METADATA: "media_metadata",
} as const;

export type MongoCollectionName =
  (typeof MONGODB_COLLECTIONS)[keyof typeof MONGODB_COLLECTIONS];

/**
 * Initializes and reconciles all production indexes for MongoDB Atlas collections.
 */
export async function initializeMongoIndexes(passedDb?: Db): Promise<{
  success: boolean;
  indexedCollections: string[];
  errors: string[];
}> {
  const db = passedDb || (await getMongoDb());
  if (!db) {
    return {
      success: false,
      indexedCollections: [],
      errors: ["Database offline or not connected."],
    };
  }

  const indexedCollections: string[] = [];
  const errors: string[] = [];

  // 1. activity_logs
  try {
    const col = db.collection(MONGODB_COLLECTIONS.ACTIVITY_LOGS);
    await col.createIndex({ actorId: 1, createdAt: -1 });
    await col.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
    await col.createIndex({ createdAt: -1 });
    // Rolling 1-year TTL retention
    await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
    indexedCollections.push(MONGODB_COLLECTIONS.ACTIVITY_LOGS);
  } catch (e: any) {
    errors.push(`activity_logs index error: ${e.message}`);
  }

  // 2. audit_events
  try {
    const col = db.collection(MONGODB_COLLECTIONS.AUDIT_EVENTS);
    await col.createIndex({ eventId: 1 }, { unique: true, sparse: true });
    await col.createIndex({ actorId: 1, createdAt: -1 });
    await col.createIndex({ resource: 1, resourceId: 1, createdAt: -1 });
    await col.createIndex({ createdAt: -1 });
    indexedCollections.push(MONGODB_COLLECTIONS.AUDIT_EVENTS);
  } catch (e: any) {
    errors.push(`audit_events index error: ${e.message}`);
  }

  // 3. notification_events
  try {
    const col = db.collection(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS);
    await col.createIndex({ eventId: 1 }, { unique: true, sparse: true });
    await col.createIndex({ recipientId: 1, status: 1, createdAt: -1 });
    await col.createIndex({ status: 1, attempts: 1, createdAt: 1 });
    // 90-day TTL retention
    await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
    indexedCollections.push(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS);
  } catch (e: any) {
    errors.push(`notification_events index error: ${e.message}`);
  }

  // 4. system_events
  try {
    const col = db.collection(MONGODB_COLLECTIONS.SYSTEM_EVENTS);
    await col.createIndex({ eventId: 1 }, { unique: true, sparse: true });
    await col.createIndex({ eventType: 1, aggregateId: 1, createdAt: -1 });
    await col.createIndex({ correlationId: 1 });
    indexedCollections.push(MONGODB_COLLECTIONS.SYSTEM_EVENTS);
  } catch (e: any) {
    errors.push(`system_events index error: ${e.message}`);
  }

  // 5. analytics_events
  try {
    const col = db.collection(MONGODB_COLLECTIONS.ANALYTICS_EVENTS);
    await col.createIndex({ eventName: 1, timestamp: -1 });
    await col.createIndex({ userId: 1, timestamp: -1 });
    // 180-day TTL retention
    await col.createIndex({ timestamp: 1 }, { expireAfterSeconds: 15552000 });
    indexedCollections.push(MONGODB_COLLECTIONS.ANALYTICS_EVENTS);
  } catch (e: any) {
    errors.push(`analytics_events index error: ${e.message}`);
  }

  return {
    success: errors.length === 0,
    indexedCollections,
    errors,
  };
}
