"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function NetworkStatusBadge() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [hasSyncError, setHasSyncError] = useState<boolean>(false);
  const { pendingCount, isSyncing, triggerManualSync } = useOfflineSync();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleSyncClick = async () => {
    setHasSyncError(false);
    try {
      const res = await triggerManualSync();
      if (res && res.failedCount > 0) {
        setHasSyncError(true);
      }
    } catch {
      setHasSyncError(true);
    }
  };

  if (isSyncing) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
        <span>SYNCING</span>
      </div>
    );
  }

  if (hasSyncError) {
    return (
      <button
        onClick={handleSyncClick}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold backdrop-blur-md hover:bg-rose-500/20 transition-all cursor-pointer"
        title="Sync failed. Click to retry."
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span>SYNC ERROR</span>
      </button>
    );
  }

  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold backdrop-blur-md">
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span>OFFLINE {pendingCount > 0 ? `(${pendingCount} pending)` : ""}</span>
      </div>
    );
  }

  // Online state
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
      <span>ONLINE</span>
      {pendingCount > 0 && (
        <button
          onClick={handleSyncClick}
          className="ml-1 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-300 transition-colors"
        >
          Sync {pendingCount}
        </button>
      )}
    </div>
  );
}
