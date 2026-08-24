/**
 * frontend/lib/mongodb/repositories/systemEventRepository.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository for system_events collection in MongoDB Atlas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ObjectId } from "mongodb";
import { getMongoDb } from "../client";
import { MONGODB_COLLECTIONS } from "../indexes";

export interface ISystemEvent {
  _id?: ObjectId;
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, any>;
  source: string;
  correlationId: string;
  createdAt: Date;
}

export interface SystemEventQueryOptions {
  eventType?: string;
  aggregateType?: string;
  aggregateId?: string;
  correlationId?: string;
  limit?: number;
  cursor?: string;
}

export async function insertSystemEvent(event: Omit<ISystemEvent, "_id" | "createdAt"> & { createdAt?: Date }): Promise<{
  inserted: boolean;
  id?: string;
}> {
  const db = await getMongoDb();
  if (!db) return { inserted: false };

  try {
    const doc: ISystemEvent = {
      ...event,
      createdAt: event.createdAt || new Date(),
    };

    const res = await db.collection(MONGODB_COLLECTIONS.SYSTEM_EVENTS).updateOne(
      { eventId: event.eventId },
      { $setOnInsert: doc },
      { upsert: true }
    );

    return {
      inserted: res.upsertedCount > 0,
      id: res.upsertedId ? res.upsertedId.toString() : undefined,
    };
  } catch (err: any) {
    if (err.code === 11000) return { inserted: false };
    console.warn("[SYSTEM_EVENT_REPO] Insert warning:", err.message);
    return { inserted: false };
  }
}

export async function findSystemEvents(options: SystemEventQueryOptions = {}): Promise<{
  data: ISystemEvent[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const db = await getMongoDb();
  if (!db) return { data: [], nextCursor: null, hasMore: false };

  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const filter: Record<string, any> = {};

  if (options.eventType) filter.eventType = options.eventType;
  if (options.aggregateType) filter.aggregateType = options.aggregateType;
  if (options.aggregateId) filter.aggregateId = options.aggregateId;
  if (options.correlationId) filter.correlationId = options.correlationId;

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
      .collection<ISystemEvent>(MONGODB_COLLECTIONS.SYSTEM_EVENTS)
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
    console.error("[SYSTEM_EVENT_REPO] Query error:", err.message);
    return { data: [], nextCursor: null, hasMore: false };
  }
}
