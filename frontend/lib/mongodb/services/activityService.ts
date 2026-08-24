/**
 * frontend/lib/mongodb/services/activityService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Activity tracking service for Member and Administrative actions.
 * Provides SHA-256 IP anonymization and asynchronous event recording.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from "crypto";
import { insertActivityLog, findActivityLogs, ActivityQueryOptions } from "../repositories/activityLogRepository";

function hashIp(ip?: string | null): string | undefined {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return undefined;
  try {
    return crypto.createHash("sha256").update(ip).digest("hex");
  } catch {
    return undefined;
  }
}

export interface RecordActivityParams {
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Records an activity event into MongoDB Atlas asynchronously without blocking HTTP response.
 */
export async function trackActivity(params: RecordActivityParams): Promise<string | null> {
  const ipHash = hashIp(params.ipAddress);
  return insertActivityLog({
    actorId: params.actorId,
    actorRole: params.actorRole,
    actorEmail: params.actorEmail,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata || {},
    ipHash,
    userAgent: params.userAgent || undefined,
  });
}

/**
 * Retrieves paginated activity feeds with RBAC filters.
 */
export async function getActivityFeed(options: ActivityQueryOptions) {
  return findActivityLogs(options);
}
