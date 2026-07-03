"use client";

import { useEffect, useState } from "react";
import { useSocketEvent } from "@/hooks/useSocket";
import NotificationPopup, { NotificationData } from "@/components/NotificationPopup";
import { requestFCMToken } from "@/lib/firebase";

export default function RealtimePopupProvider({ children }: { children: React.ReactNode }) {
  const [activeNotification, setActiveNotification] = useState<NotificationData | null>(null);

  // ─── Generic popup notification ───────────────────────────────────────────
  useSocketEvent("notification:popup", (data: any) => {
    const allowedTypes = ["new-event", "event-images-uploaded", "status", "custom", "sermon-uploaded"];
    const allowedIcons = ["event", "upload", "bell", "play"];

    setActiveNotification({
      id: String(Date.now()),
      type: (allowedTypes.includes(data.type) ? data.type : "custom") as any,
      title: data.title || "New Event Uploaded",
      description: data.description || "Fresh activity reported in portal.",
      timestamp: new Date(data.timestamp || Date.now()),
      icon: (allowedIcons.includes(data.icon) ? data.icon : "bell") as any,
      link: data.link || "/event-manager",
    });
  });

  // ─── Event upload notification ────────────────────────────────────────────
  useSocketEvent("event:uploaded", (data: any) => {
    setActiveNotification({
      id: String(Date.now()),
      type: data.popupType || "event-images-uploaded",
      title: data.title || "New Event Uploaded",
      description: data.description || `Branch: ${data.branchName || "General"}`,
      timestamp: new Date(),
      icon: "upload",
      link: "/event-manager",
    });
  });

  // ─── FCM Push Token Registration (fire-and-forget, non-blocking) ──────────
  useEffect(() => {
    if (typeof requestFCMToken !== "function") return;

    // Run after paint to avoid blocking the critical rendering path
    const timeout = setTimeout(() => {
      requestFCMToken()
        .then((token) => {
          if (!token) return;
          fetch("/api/device/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, platform: "browser", deviceType: "web" }),
          }).catch((err) => console.warn("[FCM] Device registration skipped:", err));
        })
        .catch((err) => console.warn("[FCM] Token request bypassed:", err));
    }, 3000); // delay 3s after mount so it doesn't compete with critical resources

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {children}
      <NotificationPopup
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
      />
    </>
  );
}
