"use client";

import { useEffect } from "react";
import { syncEngine } from "@/lib/offline/sync-engine";

/**
 * PWA Service Worker Registration Component
 * Registers sw.js and wires Background Sync & Message handlers.
 */
export default function ServiceWorkerProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register auto-sync handlers
    syncEngine.registerAutoSync();

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] ServiceWorker registered successfully:", reg.scope);

        // Check for updates
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New content is available; please refresh.");
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn("[PWA] ServiceWorker registration warning:", err);
      });

    // Listen to SW messages
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "TRIGGER_SYNC") {
        syncEngine.triggerSync();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, []);

  return null;
}
