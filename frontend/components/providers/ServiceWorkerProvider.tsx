"use client";

import { useEffect } from "react";

/**
 * PWA Service Worker Registration Component
 * Registers sw.js in production environments for offline caching & progressive web app support.
 */
export default function ServiceWorkerProvider() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] ServiceWorker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration skipped/failed:", err);
        });
    }
  }, []);

  return null;
}
