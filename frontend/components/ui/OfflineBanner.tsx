"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Non-intrusive connection status banner
 * Detects online/offline browser state and displays user notification.
 */
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] max-w-md p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 ${
        isOffline
          ? "bg-amber-500/90 text-slate-950 border-amber-400/50 dark:bg-amber-950/90 dark:text-amber-100 dark:border-amber-700/50"
          : "bg-emerald-500/90 text-slate-950 border-emerald-400/50 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-700/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {isOffline ? (
          <WifiOff className="w-5 h-5 shrink-0 animate-pulse text-amber-950 dark:text-amber-300" />
        ) : (
          <Wifi className="w-5 h-5 shrink-0 text-emerald-950 dark:text-emerald-300" />
        )}
        <div className="text-xs font-semibold">
          {isOffline ? (
            <span>You are currently working offline. Some remote features may be temporarily limited.</span>
          ) : (
            <span>Internet connection restored. You are back online.</span>
          )}
        </div>
      </div>
    </div>
  );
}
