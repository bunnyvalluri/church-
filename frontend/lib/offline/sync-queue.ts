/**
 * frontend/lib/offline/sync-queue.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Transactional Offline Sync Queue Manager.
 * Handles client-generated IDs, idempotency keys, action queueing, and state transitions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Stores, dbDelete, dbGet, dbGetAll, dbPut } from "./indexeddb";
import { offlineEventBus } from "./offline-events";

export type QueueActionType = "CREATE" | "UPDATE" | "DELETE";
export type QueueStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED" | "CONFLICT";

export interface SyncQueueItem {
  clientOperationId: string; // Idempotency Key
  entityType: string;        // e.g. 'EVENT', 'PRAYER_REQUEST', 'VOLUNTEER'
  entityId: string;          // ID of entity
  action: QueueActionType;
  endpoint: string;          // Server endpoint target
  payload: any;              // JSON payload
  clientTimestamp: string;
  status: QueueStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  version?: number;
}

export function generateClientOperationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `client_op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateClientEntityId(prefix = "client_id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class SyncQueueManager {
  /**
   * Enqueue a new offline write action
   */
  async enqueueAction(
    item: Omit<SyncQueueItem, "clientOperationId" | "clientTimestamp" | "status" | "retryCount"> & {
      clientOperationId?: string;
    }
  ): Promise<SyncQueueItem> {
    const queueItem: SyncQueueItem = {
      clientOperationId: item.clientOperationId || generateClientOperationId(),
      entityType: item.entityType,
      entityId: item.entityId,
      action: item.action,
      endpoint: item.endpoint,
      payload: item.payload,
      clientTimestamp: new Date().toISOString(),
      status: "PENDING",
      retryCount: 0,
      maxRetries: item.maxRetries || 5,
      version: item.version || 1,
    };

    await dbPut(Stores.SYNC_QUEUE, queueItem);
    this.notifyQueueChanged();
    return queueItem;
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const all = await dbGetAll<SyncQueueItem>(Stores.SYNC_QUEUE);
    return all.filter((item) => item.status === "PENDING" || item.status === "FAILED");
  }

  async getQueueItem(clientOperationId: string): Promise<SyncQueueItem | undefined> {
    return dbGet<SyncQueueItem>(Stores.SYNC_QUEUE, clientOperationId);
  }

  async updateItemStatus(
    clientOperationId: string,
    status: QueueStatus,
    errorMsg?: string
  ): Promise<void> {
    const item = await this.getQueueItem(clientOperationId);
    if (!item) return;

    item.status = status;
    if (errorMsg) {
      item.lastError = errorMsg;
    }
    if (status === "FAILED") {
      item.retryCount += 1;
    }

    await dbPut(Stores.SYNC_QUEUE, item);
    this.notifyQueueChanged();
  }

  async removeQueueItem(clientOperationId: string): Promise<void> {
    await dbDelete(Stores.SYNC_QUEUE, clientOperationId);
    this.notifyQueueChanged();
  }

  async getQueueLength(): Promise<number> {
    const items = await this.getPendingItems();
    return items.length;
  }

  private async notifyQueueChanged() {
    const pendingItems = await this.getPendingItems();
    offlineEventBus.emit("queue-updated", {
      pendingCount: pendingItems.length,
    });
  }
}

export const syncQueueManager = new SyncQueueManager();
