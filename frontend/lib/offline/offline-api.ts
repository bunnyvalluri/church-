/**
 * frontend/lib/offline/offline-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Transparent Offline API Fetch Interceptor & Offline CRUD Helper.
 * Automatically serves GET requests from IndexedDB/Cache when offline,
 * and queues POST/PUT/DELETE mutations when disconnected.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Stores, dbGet, dbGetAll, dbPut } from "./indexeddb";
import { networkManager } from "./network-manager";
import { generateClientEntityId, syncQueueManager } from "./sync-queue";

export interface OfflineFetchOptions extends RequestInit {
  entityType?: string;
  storeName?: Stores;
  entityId?: string;
  skipQueue?: boolean;
}

export async function offlineFetch<T = any>(
  url: string,
  options: OfflineFetchOptions = {}
): Promise<{ data: T | null; isOffline: boolean; fromCache?: boolean; queued?: boolean }> {
  const method = (options.method || "GET").toUpperCase();
  const isOnline = networkManager.isOnline();

  // 1. GET Requests (Read Path)
  if (method === "GET") {
    if (isOnline) {
      try {
        const res = await fetch(url, options);
        if (res.ok) {
          const data = await res.json();
          // Optionally cache data if storeName provided
          if (options.storeName && Array.isArray(data)) {
            for (const item of data) {
              if (item.id) {
                await dbPut(options.storeName, { ...item, syncStatus: "synced" });
              }
            }
          }
          return { data, isOffline: false, fromCache: false };
        }
      } catch (err) {
        console.warn(`[OfflineAPI] Network fetch failed for ${url}, attempting IndexedDB fallback.`);
      }
    }

    // Offline or Network Failure Fallback
    if (options.storeName) {
      if (options.entityId) {
        const cached = await dbGet<T>(options.storeName, options.entityId);
        if (cached) return { data: cached, isOffline: true, fromCache: true };
      } else {
        const cachedList = await dbGetAll<T>(options.storeName);
        if (cachedList && cachedList.length > 0) {
          return { data: cachedList as any, isOffline: true, fromCache: true };
        }
      }
    }

    return { data: null, isOffline: true, fromCache: false };
  }

  // 2. Mutations (POST, PUT, DELETE)
  if (isOnline) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        const data = await res.json();
        return { data, isOffline: false, queued: false };
      }
    } catch (err) {
      console.warn(`[OfflineAPI] Mutation fetch failed for ${url}, fallback to sync queue.`);
    }
  }

  // If Offline or Network Failure -> Queue Mutation
  if (options.skipQueue) {
    throw new Error("Device is offline and skipQueue option was specified.");
  }

  const payload = options.body ? JSON.parse(options.body as string) : {};
  const entityId = options.entityId || payload.id || generateClientEntityId(options.entityType?.toLowerCase() || "item");
  payload.id = entityId;
  payload.syncStatus = "pending";

  // Store in IndexedDB locally for optimistic UI
  if (options.storeName) {
    await dbPut(options.storeName, payload);
  }

  // Queue action for background sync
  const queuedItem = await syncQueueManager.enqueueAction({
    entityType: options.entityType || "GENERIC",
    entityId,
    action: method as any,
    endpoint: url,
    payload,
    maxRetries: 5,
  });

  return {
    data: {
      ...payload,
      clientOperationId: queuedItem.clientOperationId,
      syncStatus: "pending",
      offlineQueued: true,
    } as any,
    isOffline: true,
    queued: true,
  };
}
