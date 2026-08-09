/**
 * frontend/lib/offline/cache-manager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-Role Cache Isolation & Storage Quota Manager.
 * Prevents unauthorized offline access across user roles and automatically
 * purges private user caches on sign-out.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { dbClearUserPrivateStores } from "./indexeddb";

export class CacheManager {
  private PUBLIC_CACHE = "kcm-public-cache-v1";

  public getCacheNameForUser(role?: string, userId?: string): string {
    if (!userId || !role) {
      return this.PUBLIC_CACHE;
    }
    const cleanRole = role.toLowerCase();
    return `kcm-${cleanRole}-cache-${userId}`;
  }

  public async purgeUserPrivateCaches(userId?: string): Promise<void> {
    if (typeof window === "undefined" || !("caches" in window)) return;

    try {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key !== this.PUBLIC_CACHE) {
          // If userId is provided, delete matching user cache; otherwise delete all non-public caches
          if (!userId || key.includes(userId)) {
            await caches.delete(key);
            console.info(`[CacheManager] Purged private cache: ${key}`);
          }
        }
      }

      // Also clear private IndexedDB stores
      await dbClearUserPrivateStores();
    } catch (err) {
      console.warn("[CacheManager] Error purging private caches:", err);
    }
  }

  public async checkStorageQuota(): Promise<{ quota: number; usage: number; percentageUsed: number }> {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 1;
      const usage = estimate.usage || 0;
      return {
        quota,
        usage,
        percentageUsed: Math.min(100, Math.round((usage / quota) * 100)),
      };
    }
    return { quota: 0, usage: 0, percentageUsed: 0 };
  }
}

export const cacheManager = new CacheManager();
