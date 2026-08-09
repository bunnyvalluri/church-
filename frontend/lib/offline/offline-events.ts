/**
 * frontend/lib/offline/offline-events.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Strongly-typed Event Emitter for Offline Status, Queue Updates, & Conflicts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ConnectionStatus = "ONLINE" | "OFFLINE" | "SLOW_NETWORK" | "BACKEND_UNAVAILABLE" | "SYNCING";

export interface SyncProgressEvent {
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  currentAction?: string;
}

export interface ConflictEvent {
  clientOperationId: string;
  entityType: string;
  localData: any;
  serverData: any;
  message: string;
}

type EventListener<T = any> = (data: T) => void;

class OfflineEventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  on<T = any>(event: string, callback: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit<T = any>(event: string, data: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[OfflineEventBus] Error handling event ${event}:`, e);
        }
      });
    }
  }
}

export const offlineEventBus = new OfflineEventBus();
