/**
 * frontend/lib/mongodb/services/eventPublisher.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Polyglot Event Publisher & Outbox Bridge.
 * Receives domain events post-PostgreSQL transaction, persists them to
 * MongoDB system_events, broadcasts via Socket.io, and initiates downstream dispatch.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from "crypto";
import { insertSystemEvent } from "../repositories/systemEventRepository";
import { trackActivity } from "./activityService";

export interface DomainEventPayload {
  eventId?: string;
  eventType: string; // e.g. "event.created", "donation.received", "sermon.published"
  aggregateType: string; // "Event", "Donation", "Sermon", "Member"
  aggregateId: string;
  payload: Record<string, any>;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  correlationId?: string;
  source?: string;
  broadcastSocket?: boolean;
  socketRoom?: string;
  socketPopupType?: string;
}

/**
 * Publishes a domain event across the polyglot persistence architecture.
 * Ensures MongoDB persistence, idempotency, and realtime Socket.io fanout.
 */
export async function publishDomainEvent(event: DomainEventPayload): Promise<{
  eventId: string;
  persistedToMongo: boolean;
  socketBroadcast: boolean;
}> {
  const eventId = event.eventId || `evt_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const correlationId = event.correlationId || `corr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const source = event.source || "kcm-frontend-nextjs";

  // 1. Persist to MongoDB system_events
  const mongoRes = await insertSystemEvent({
    eventId,
    eventType: event.eventType,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    payload: event.payload,
    source,
    correlationId,
  });

  // 2. Track activity if actor is present
  if (event.actorId) {
    trackActivity({
      actorId: event.actorId,
      actorRole: event.actorRole || "SYSTEM",
      actorEmail: event.actorEmail,
      action: event.eventType.toUpperCase().replace(/\./g, "_"),
      entityType: event.aggregateType.toLowerCase(),
      entityId: event.aggregateId,
      metadata: event.payload,
    }).catch(() => {});
  }

  // 3. Socket.io Real-time Broadcast via Companion Backend
  let socketBroadcast = false;
  if (event.broadcastSocket !== false) {
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: event.eventType,
          room: event.socketRoom,
          payload: {
            ...event.payload,
            eventId,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            popupType: event.socketPopupType || "domain-event",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      socketBroadcast = response.ok;
    } catch (socketErr) {
      // Non-blocking warning
      socketBroadcast = false;
    }
  }

  return {
    eventId,
    persistedToMongo: mongoRes.inserted,
    socketBroadcast,
  };
}
