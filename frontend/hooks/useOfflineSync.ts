"use client";

import { useEffect, useState, useCallback } from "react";
import { offlineEventBus } from "@/lib/offline/offline-events";
import { syncEngine } from "@/lib/offline/sync-engine";
import { syncQueueManager } from "@/lib/offline/sync-queue";

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      const count = await syncQueueManager.getQueueLength();
      setPendingCount(count);
    } catch (e) {
      // Ignore initial render errors if IDB not ready
    }
  }, []);

  useEffect(() => {
    refreshCount();

    const unsubQueue = offlineEventBus.on<{ pendingCount: number }>("queue-updated", (data) => {
      setPendingCount(data.pendingCount);
    });

    const unsubProgress = offlineEventBus.on("sync-progress", () => {
      setIsSyncing(true);
      refreshCount();
    });

    const unsubComplete = offlineEventBus.on<{ successCount: number; failedCount: number }>(
      "sync-complete",
      (res) => {
        setIsSyncing(false);
        setLastSyncStatus(`Synced ${res.successCount} items, ${res.failedCount} failed.`);
        refreshCount();
      }
    );

    return () => {
      unsubQueue();
      unsubProgress();
      unsubComplete();
    };
  }, [refreshCount]);

  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    const res = await syncEngine.triggerSync();
    setIsSyncing(false);
    return res;
  }, []);

  return {
    pendingCount,
    isSyncing,
    lastSyncStatus,
    triggerManualSync,
    refreshCount,
  };
}
