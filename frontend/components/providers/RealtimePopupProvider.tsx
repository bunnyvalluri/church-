"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import NotificationPopup, { NotificationData } from "@/components/NotificationPopup";
import { requestFCMToken } from "@/lib/firebase";

export default function RealtimePopupProvider({ children }: { children: React.ReactNode }) {
  const [activeNotification, setActiveNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    // 1. Initialize Socket.io connection to backend companion server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to realtime companion server:", socket.id);
    });

    // 2. Listen for generic socket popups and event upload notifications
    socket.on("notification:popup", (data: any) => {
      console.log("[SOCKET] Received popup notification:", data);
      const allowedTypes = [
        "new-event",
        "event-images-uploaded",
        "status",
        "custom",
        "sermon-uploaded",
        "report-submitted",
        "service-created",
      ];
      const allowedIcons = ["event", "upload", "bell", "play", "report", "service"];

      setActiveNotification({
        id: String(Date.now()),
        type: (allowedTypes.includes(data.popupType || data.type) ? (data.popupType || data.type) : "custom") as any,
        title: data.title || "New Event Uploaded",
        description: data.description || "Fresh activity reported in portal.",
        timestamp: new Date(data.timestamp || Date.now()),
        icon: (allowedIcons.includes(data.icon) ? data.icon : "bell") as any,
        link: data.link || "/event-manager",
      });
    });

    // event:uploaded → website popup (existing sermon/event flow)
    socket.on("event:uploaded", (data: any) => {
      console.log("[SOCKET] Received event:uploaded event:", data);
      setActiveNotification({
        id: String(Date.now()),
        type: (data.popupType as any) || "service-created",
        title: data.title || "New Service Scheduled",
        description: data.description || `Branch: ${data.branchName || "General"}`,
        timestamp: new Date(),
        icon: "service",
        link: data.link || "/event-manager",
      });
    });

    // report-submitted → website popup (new — Event Report flow)
    socket.on("report-submitted", (data: any) => {
      console.log("[SOCKET] Received report-submitted event:", data);
      setActiveNotification({
        id: String(Date.now()),
        type: "report-submitted",
        title: "📋 New Event Report",
        description: `"${data.title}" from ${data.branchName} • ${data.attendanceCount} attended`,
        timestamp: new Date(data.timestamp || Date.now()),
        icon: "report",
        link: "/event-manager",
      });
    });

    // service-created → website popup (new — Worship Service flow)
    socket.on("service-created", (data: any) => {
      console.log("[SOCKET] Received service-created event:", data);
      setActiveNotification({
        id: String(Date.now()),
        type: "service-created",
        title: "🗓️ New Service Scheduled",
        description: `"${data.title}" at ${data.location || data.branchName}`,
        timestamp: new Date(data.timestamp || Date.now()),
        icon: "service",
        link: "/events",
      });
    });

    // 3. Register Firebase Cloud Messaging Push Token in background
    if (typeof requestFCMToken === "function") {
      requestFCMToken().then((token) => {
        if (token) {
          fetch("/api/device/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, platform: "browser", deviceType: "web" }),
          }).catch((err) => console.warn("[FCM] Device registration skipped:", err));
        }
      }).catch((err) => console.warn("[FCM] Token request bypassed:", err));
    }

    return () => {
      socket.disconnect();
    };
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
