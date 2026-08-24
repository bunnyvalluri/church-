/**
 * frontend/lib/mongodb/repositories/activityLogRepository.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository for activity_logs collection in MongoDB Atlas.
 * Implements cursor-based pagination and bounded projection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ObjectId } from "mongodb";
import { getMongoDb } from "../client";
import { MONGODB_COLLECTIONS } from "../indexes";

export interface IActivityLog {
  _id?: ObjectId;
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ActivityQueryOptions {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
  cursor?: string; // Base64 or ISO string timestamp / ObjectId
}

export async function insertActivityLog(log: Omit<IActivityLog, "_id" | "createdAt"> & { createdAt?: Date }): Promise<string | null> {
  const db = await getMongoDb();
  if (!db) return null;

  try {
    const doc: IActivityLog = {
      ...log,
      createdAt: log.createdAt || new Date(),
    };
    const res = await db.collection(MONGODB_COLLECTIONS.ACTIVITY_LOGS).insertOne(doc);
    return res.insertedId.toString();
  } catch (err: any) {
    console.warn("[ACTIVITY_LOG_REPO] Insert failed:", err.message);
    return null;
  }
}

export async function findActivityLogs(options: ActivityQueryOptions = {}): Promise<{
  data: IActivityLog[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const db = await getMongoDb();
  if (!db) {
    return { data: [], nextCursor: null, hasMore: false };
  }

  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const filter: Record<string, any> = {};

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
      // ignore invalid cursor
    }
  }

  try {
    const rawLogs = await db
      .collection<IActivityLog>(MONGODB_COLLECTIONS.ACTIVITY_LOGS)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = rawLogs.length > limit;
    const data = hasMore ? rawLogs.slice(0, limit) : rawLogs;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].createdAt.toISOString()
        : null;

    return {
      data,
      nextCursor,
      hasMore,
    };
  } catch (err: any) {
    console.error("[ACTIVITY_LOG_REPO] Query error:", err.message);
    return { data: [], nextCursor: null, hasMore: false };
  }
}
