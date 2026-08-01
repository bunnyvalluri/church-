/**
 * frontend/hooks/useLoopStatus.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React Hook for Real-time Loop Status & Telemetry (Socket.io)
 * Enables Admin, Pastor, and Member portals to receive instant updates when:
 * - A new Event or Sermon is processed via automation loops (`event:new`, `sermon:new`).
 * - A Security Alert or System Warning is raised (`system:alert`).
 * - Real-time notification popups are emitted (`notification:popup`).
 * - Loop health state changes occur.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface LoopHealthTelemetry {
  status: string;
  timestamp: string;
  loops: {
    eventAutomationLoop: string;
    sermonAutomationLoop: string;
    securityAuditLoop: string;
    uploadVerificationLoop: string;
    notificationLoop: string;
    deploymentHealthLoop: string;
    databaseAuditLoop: string;
  };
  metrics?: {
    securityAnomalies: number;
    verifiedMediaAssets: number;
    databaseLatencyMs: number;
    expiredSessionsCleaned: number;
  };
}

export interface PopupAlert {
  type: string;
  title: string;
  message?: string;
  description?: string;
  timestamp: string;
  eventId?: string;
  sermonId?: string;
  imageUrl?: string;
}

export function useLoopStatus() {
  const [telemetry, setTelemetry] = useState<LoopHealthTelemetry | null>(null);
  const [activePopups, setActivePopups] = useState<PopupAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen to real-time notification popups emitted by loops
    socket.on('notification:popup', (popup: PopupAlert) => {
      setActivePopups((prev) => [popup, ...prev].slice(0, 5));
    });

    // Listen to system alerts emitted by deployment / security loops
    socket.on('system:alert', (alert: PopupAlert) => {
      setActivePopups((prev) => [alert, ...prev].slice(0, 5));
    });

    // Fetch initial diagnostic health state
    fetch('/api/loops/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.data) {
          setTelemetry(data.data);
        }
      })
      .catch((err) => console.warn('[useLoopStatus] Initial health fetch note:', err));

    return () => {
      socket.disconnect();
    };
  }, []);

  const dismissPopup = (index: number) => {
    setActivePopups((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    telemetry,
    activePopups,
    isConnected,
    dismissPopup,
  };
}
