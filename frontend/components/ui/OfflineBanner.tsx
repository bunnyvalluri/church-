"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function OfflineBanner() {
  const { status, isOffline, isSyncing, isSlowNetwork, isBackendUnavailable } = useNetworkStatus();
  const { pendingCount, triggerManualSync } = useOfflineSync();
  const [showReconnected, setShowReconnected] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  useEffect(() => {
    if (prevStatus === "OFFLINE" && (status === "ONLINE" || status === "SYNCING")) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 5000);
      return () => clearTimeout(timer);
    }
    setPrevStatus(status);
  }, [status, prevStatus]);

  if (!isOffline && !showReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] max-w-md p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 ${
        isOffline
          ? "bg-amber-500/90 text-slate-950 border-amber-400/50 dark:bg-amber-950/90 dark:text-amber-100 dark:border-amber-700/50"
          : isSlowNetwork || isBackendUnavailable
          ? "bg-orange-500/90 text-slate-950 border-orange-400/50 dark:bg-orange-950/90 dark:text-orange-100 dark:border-orange-700/50"
          : isSyncing
          ? "bg-blue-500/90 text-white border-blue-400/50 dark:bg-blue-950/90 dark:text-blue-100 dark:border-blue-700/50"
          : "bg-emerald-500/90 text-slate-950 border-emerald-400/50 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-700/50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="w-5 h-5 shrink-0 animate-pulse text-amber-950 dark:text-amber-300" />
          ) : isSyncing ? (
            <RefreshCw className="w-5 h-5 shrink-0 animate-spin text-blue-100" />
          ) : isSlowNetwork || isBackendUnavailable ? (
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce text-orange-950 dark:text-orange-300" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-950 dark:text-emerald-300" />
          )}

          <div className="text-xs font-semibold">
            {isOffline ? (
              <span>You're currently offline. Your changes will sync automatically when reconnected.</span>
            ) : isSyncing ? (
              <span>Synchronizing offline changes...</span>
            ) : isSlowNetwork ? (
              <span>Slow network connection detected. Using local cache.</span>
            ) : isBackendUnavailable ? (
              <span>Server temporarily unreachable. Operating in offline mode.</span>
            ) : (
              <span>Connection restored. All systems online.</span>
            )}
          </div>
        </div>

        {pendingCount > 0 && !isSyncing && (
          <button
            onClick={() => triggerManualSync()}
            className="shrink-0 text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync ({pendingCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
