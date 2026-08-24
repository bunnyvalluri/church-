/**
 * frontend/lib/mongodb/services/auditService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Security & Administrative Audit Service.
 * Records immutable, idempotent audit events with before/after state diffs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from "crypto";
import { insertAuditEvent, findAuditEvents, AuditQueryOptions } from "../repositories/auditEventRepository";

function hashIp(ip?: string | null): string | undefined {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return undefined;
  try {
    return crypto.createHash("sha256").update(ip).digest("hex");
  } catch {
    return undefined;
  }
}

export interface RecordAuditParams {
  eventId?: string;
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}

/**
 * Records a security or administrative change into MongoDB audit_events.
 */
export async function recordAuditEvent(params: RecordAuditParams) {
  const eventId = params.eventId || `audit_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const ipHash = hashIp(params.ipAddress);

  return insertAuditEvent({
    eventId,
    actorId: params.actorId,
    actorRole: params.actorRole,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    beforeState: params.beforeState,
    afterState: params.afterState,
    metadata: params.metadata || {},
    ipHash,
  });
}

/**
 * Query audit event timeline with cursor pagination.
 */
export async function getAuditTimeline(options: AuditQueryOptions) {
  return findAuditEvents(options);
}
