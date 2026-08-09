/**
 * frontend/lib/offline/conflict-manager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Conflict Resolution Manager.
 * Handles entity version conflicts between client and server states.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Stores, dbDelete, dbGet, dbGetAll, dbPut } from "./indexeddb";
import { syncQueueManager } from "./sync-queue";

export interface ConflictRecord {
  clientOperationId: string;
  entityType: string;
  entityId: string;
  localPayload: any;
  serverPayload: any;
  localVersion: number;
  serverVersion: number;
  createdAt: string;
  resolved: boolean;
  resolutionStrategy?: "KEEP_LOCAL" | "KEEP_SERVER" | "MANUAL_MERGE";
}

export class ConflictManager {
  async recordConflict(conflict: Omit<ConflictRecord, "createdAt" | "resolved">): Promise<void> {
    const record: ConflictRecord = {
      ...conflict,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    await dbPut(Stores.SYNC_CONFLICTS, record);
  }

  async getUnresolvedConflicts(): Promise<ConflictRecord[]> {
    const all = await dbGetAll<ConflictRecord>(Stores.SYNC_CONFLICTS);
    return all.filter((c) => !c.resolved);
  }

  async resolveConflict(
    clientOperationId: string,
    strategy: "KEEP_LOCAL" | "KEEP_SERVER" | "MANUAL_MERGE",
    mergedPayload?: any
  ): Promise<void> {
    const conflict = await dbGet<ConflictRecord>(Stores.SYNC_CONFLICTS, clientOperationId);
    if (!conflict) return;

    conflict.resolved = true;
    conflict.resolutionStrategy = strategy;
    await dbPut(Stores.SYNC_CONFLICTS, conflict);

    if (strategy === "KEEP_LOCAL") {
      // Reset retry count and mark pending in sync queue
      const queueItem = await syncQueueManager.getQueueItem(clientOperationId);
      if (queueItem) {
        queueItem.status = "PENDING";
        queueItem.version = conflict.serverVersion + 1; // force higher version
        await dbPut(Stores.SYNC_QUEUE, queueItem);
      }
    } else if (strategy === "KEEP_SERVER") {
      // Remove queue item so server version remains authoritative
      await syncQueueManager.removeQueueItem(clientOperationId);
    } else if (strategy === "MANUAL_MERGE" && mergedPayload) {
      const queueItem = await syncQueueManager.getQueueItem(clientOperationId);
      if (queueItem) {
        queueItem.payload = mergedPayload;
        queueItem.status = "PENDING";
        queueItem.version = conflict.serverVersion + 1;
        await dbPut(Stores.SYNC_QUEUE, queueItem);
      }
    }
  }

  async clearResolvedConflicts(): Promise<void> {
    const all = await dbGetAll<ConflictRecord>(Stores.SYNC_CONFLICTS);
    for (const c of all) {
      if (c.resolved) {
        await dbDelete(Stores.SYNC_CONFLICTS, c.clientOperationId);
      }
    }
  }
}

export const conflictManager = new ConflictManager();
