/**
 * frontend/lib/mongodb/repositories/analyticsEventRepository.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository for analytics_events collection in MongoDB Atlas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ObjectId } from "mongodb";
import { getMongoDb } from "../client";
import { MONGODB_COLLECTIONS } from "../indexes";

export interface IAnalyticsEvent {
  _id?: ObjectId;
  eventName: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsQueryOptions {
  eventName?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  cursor?: string;
}

export async function insertAnalyticsEvent(event: Omit<IAnalyticsEvent, "_id" | "timestamp"> & { timestamp?: Date }): Promise<string | null> {
  const db = await getMongoDb();
  if (!db) return null;

  try {
    const doc: IAnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    const res = await db.collection(MONGODB_COLLECTIONS.ANALYTICS_EVENTS).insertOne(doc);
    return res.insertedId.toString();
  } catch (err: any) {
    console.warn("[ANALYTICS_EVENT_REPO] Insert error:", err.message);
    return null;
  }
}

export async function findAnalyticsEvents(options: AnalyticsQueryOptions = {}): Promise<{
  data: IAnalyticsEvent[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const db = await getMongoDb();
  if (!db) return { data: [], nextCursor: null, hasMore: false };

  const limit = Math.min(Math.max(options.limit || 50, 1), 200);
  const filter: Record<string, any> = {};

  if (options.eventName) filter.eventName = options.eventName;
  if (options.userId) filter.userId = options.userId;

  if (options.startDate || options.endDate) {
    filter.timestamp = {};
    if (options.startDate) filter.timestamp.$gte = options.startDate;
    if (options.endDate) filter.timestamp.$lte = options.endDate;
  }

  if (options.cursor) {
    try {
      const cursorDate = new Date(options.cursor);
      if (!isNaN(cursorDate.getTime())) {
        filter.timestamp = { ...(filter.timestamp || {}), $lt: cursorDate };
      }
    } catch {
      // ignore invalid cursor
    }
  }

  try {
    const rawEvents = await db
      .collection<IAnalyticsEvent>(MONGODB_COLLECTIONS.ANALYTICS_EVENTS)
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = rawEvents.length > limit;
    const data = hasMore ? rawEvents.slice(0, limit) : rawEvents;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].timestamp.toISOString()
        : null;

    return { data, nextCursor, hasMore };
  } catch (err: any) {
    console.error("[ANALYTICS_EVENT_REPO] Query error:", err.message);
    return { data: [], nextCursor: null, hasMore: false };
  }
}
