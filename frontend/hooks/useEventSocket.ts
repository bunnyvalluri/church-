'use client';

/**
 * frontend/hooks/useEventSocket.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook for real-time event updates via Socket.io.
 *
 * Subscribes to:
 *   - `event:new`           — triggers SWR revalidation for /events
 *   - `notification:popup`  — shows in-app toast/banner notification
 *   - `notification:broadcast` — global broadcast messages
 *
 * Usage:
 *   const { isConnected, latestEvent, notification } = useEventSocket();
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSWRConfig } from 'swr';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface KcmEvent {
  id: string;
  title: string;
  date: string;
  branch?: string;
  image?: string;
  slug?: string;
}

interface NotificationPopup {
  type: string;
  title: string;
  message?: string;
  description?: string;
  eventId?: string;
  imageUrl?: string;
  timestamp: string;
  icon?: string;
  link?: string;
}

interface UseEventSocketReturn {
  isConnected: boolean;
  latestEvent: KcmEvent | null;
  notification: NotificationPopup | null;
  clearNotification: () => void;
}

export function useEventSocket(): UseEventSocketReturn {
  const { mutate } = useSWRConfig();
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<KcmEvent | null>(null);
  const [notification, setNotification] = useState<NotificationPopup | null>(null);
  const socketRef = useRef<ReturnType<typeof import('socket.io-client')['io']> | null>(null);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    // Dynamically import socket.io-client to avoid SSR issues
    let isMounted = true;

    async function initSocket() {
      try {
        const { io } = await import('socket.io-client');

        const socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (!isMounted) return;
          console.log('[SOCKET] Connected to KCM real-time server:', socket.id);
          setIsConnected(true);

          // Join the global events room
          socket.emit('join', 'events');
          socket.emit('join', 'kcm-global');
        });

        socket.on('disconnect', (reason) => {
          if (!isMounted) return;
          console.log('[SOCKET] Disconnected:', reason);
          setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
          if (!isMounted) return;
          console.warn('[SOCKET] Connection error:', err.message);
          setIsConnected(false);
        });

        // New event published — revalidate all event caches
        socket.on('event:new', (event: KcmEvent) => {
          if (!isMounted) return;
          console.log('[SOCKET] New event received:', event.title);
          setLatestEvent(event);

          // Revalidate SWR caches for events endpoints
          mutate('/api/events');
          mutate('/api/events?status=PUBLISHED');
          mutate((key: string) => typeof key === 'string' && key.includes('/events'), undefined, { revalidate: true });
        });

        // In-app popup notification (event published, sermon uploaded, etc.)
        socket.on('notification:popup', (popup: NotificationPopup) => {
          if (!isMounted) return;
          console.log('[SOCKET] Popup notification:', popup.title);
          setNotification(popup);

          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            if (isMounted) setNotification(null);
          }, 8000);
        });

        // Global broadcast notification
        socket.on('notification:broadcast', (message: NotificationPopup) => {
          if (!isMounted) return;
          setNotification(message);
        });

      } catch (err) {
        console.warn('[SOCKET] socket.io-client not available:', err);
      }
    }

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [mutate]);

  return { isConnected, latestEvent, notification, clearNotification };
}

export default useEventSocket;
