/**
 * frontend/lib/mongodb/repositories/auditEventRepository.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository for audit_events collection in MongoDB Atlas.
 * Enforces idempotency via unique eventId and provides cursor-based queries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ObjectId } from "mongodb";
import { getMongoDb } from "../client";
import { MONGODB_COLLECTIONS } from "../indexes";

export interface IAuditEvent {
  _id?: ObjectId;
  eventId: string; // Idempotency key
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  metadata?: Record<string, any>;
  ipHash?: string;
  createdAt: Date;
}

export interface AuditQueryOptions {
  actorId?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Idempotently inserts an audit event.
 * If an event with the given eventId already exists, it is silently deduplicated.
 */
export async function insertAuditEvent(event: Omit<IAuditEvent, "_id" | "createdAt"> & { createdAt?: Date }): Promise<{
  inserted: boolean;
  id?: string;
}> {
  const db = await getMongoDb();
  if (!db) return { inserted: false };

  try {
    const doc: IAuditEvent = {
      ...event,
      createdAt: event.createdAt || new Date(),
    };

    // Use updateOne with upsert to guarantee idempotency on eventId
    const res = await db.collection(MONGODB_COLLECTIONS.AUDIT_EVENTS).updateOne(
      { eventId: event.eventId },
      { $setOnInsert: doc },
      { upsert: true }
    );

    return {
      inserted: res.upsertedCount > 0,
      id: res.upsertedId ? res.upsertedId.toString() : undefined,
    };
  } catch (err: any) {
    if (err.code === 11000) {
      // Duplicate key error on eventId index -> already recorded
      return { inserted: false };
    }
    console.warn("[AUDIT_EVENT_REPO] Insert warning:", err.message);
    return { inserted: false };
  }
}

export async function findAuditEvents(options: AuditQueryOptions = {}): Promise<{
  data: IAuditEvent[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const db = await getMongoDb();
  if (!db) return { data: [], nextCursor: null, hasMore: false };

  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const filter: Record<string, any> = {};

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
      // ignore invalid cursor
    }
  }

  try {
    const rawEvents = await db
      .collection<IAuditEvent>(MONGODB_COLLECTIONS.AUDIT_EVENTS)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = rawEvents.length > limit;
    const data = hasMore ? rawEvents.slice(0, limit) : rawEvents;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].createdAt.toISOString()
        : null;

    return { data, nextCursor, hasMore };
  } catch (err: any) {
    console.error("[AUDIT_EVENT_REPO] Query error:", err.message);
    return { data: [], nextCursor: null, hasMore: false };
  }
}
