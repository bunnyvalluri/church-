"use client";

import { useEffect, useState } from "react";
import { ConnectionStatus, offlineEventBus } from "@/lib/offline/offline-events";
import { networkManager } from "@/lib/offline/network-manager";

export function useNetworkStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(() => networkManager.getStatus());

  useEffect(() => {
    // Initial sync check
    setStatus(networkManager.getStatus());
    networkManager.checkRealConnectivity();

    const unsubscribe = offlineEventBus.on<ConnectionStatus>("status-changed", (newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    status,
    isOnline: status === "ONLINE" || status === "SYNCING" || status === "SLOW_NETWORK",
    isOffline: status === "OFFLINE",
    isSyncing: status === "SYNCING",
    isSlowNetwork: status === "SLOW_NETWORK",
    isBackendUnavailable: status === "BACKEND_UNAVAILABLE",
    checkConnectivity: () => networkManager.checkRealConnectivity(),
  };
}
