/**
 * frontend/lib/mongodb/repositories/notificationEventRepository.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository for notification_events collection in MongoDB Atlas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ObjectId } from "mongodb";
import { getMongoDb } from "../client";
import { MONGODB_COLLECTIONS } from "../indexes";

export type NotificationChannel = "PUSH" | "SMS" | "WHATSAPP" | "EMAIL" | "SOCKET";
export type NotificationStatus = "QUEUED" | "PROCESSING" | "DELIVERED" | "FAILED" | "RETRYING";

export interface INotificationEvent {
  _id?: ObjectId;
  eventId: string;
  recipientId: string;
  recipientRole?: string;
  recipientAddress?: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  payload?: Record<string, any>;
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  provider?: string;
  providerMessageId?: string;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  deliveredAt?: Date;
}

export interface NotificationQueryOptions {
  recipientId?: string;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  limit?: number;
  cursor?: string;
}

export async function insertNotificationEvent(event: Omit<INotificationEvent, "_id" | "createdAt"> & { createdAt?: Date }): Promise<{
  inserted: boolean;
  id?: string;
}> {
  const db = await getMongoDb();
  if (!db) return { inserted: false };

  try {
    const doc: INotificationEvent = {
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
  } catch (err: any) {
    if (err.code === 11000) return { inserted: false };
    console.warn("[NOTIF_EVENT_REPO] Insert warning:", err.message);
    return { inserted: false };
  }
}

export async function updateNotificationStatus(
  eventId: string,
  update: {
    status: NotificationStatus;
    attempts?: number;
    provider?: string;
    providerMessageId?: string;
    error?: string;
    deliveredAt?: Date;
    processedAt?: Date;
  }
): Promise<boolean> {
  const db = await getMongoDb();
  if (!db) return false;

  try {
    const setPayload: Record<string, any> = {
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
  } catch (err: any) {
    console.error("[NOTIF_EVENT_REPO] Status update error:", err.message);
    return false;
  }
}

export async function findNotificationEvents(options: NotificationQueryOptions = {}): Promise<{
  data: INotificationEvent[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const db = await getMongoDb();
  if (!db) return { data: [], nextCursor: null, hasMore: false };

  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const filter: Record<string, any> = {};

  if (options.recipientId) filter.recipientId = options.recipientId;
  if (options.status) filter.status = options.status;
  if (options.channel) filter.channel = options.channel;

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
      .collection<INotificationEvent>(MONGODB_COLLECTIONS.NOTIFICATION_EVENTS)
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
    console.error("[NOTIF_EVENT_REPO] Query error:", err.message);
    return { data: [], nextCursor: null, hasMore: false };
  }
}
