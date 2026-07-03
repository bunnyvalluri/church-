/**
 * useSocket — Singleton Socket.io Connection Manager
 *
 * Problem solved: Events.tsx + Sermons.tsx + RealtimePopupProvider.tsx were each
 * calling io() independently — creating 3 TCP connections per page load.
 *
 * Solution: One shared socket instance for the entire app session. Components
 * subscribe to events via this hook. Cleanup removes only the specific listener,
 * not the socket itself. Socket is lazily created on first use.
 */

import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

// Module-level singleton — one socket for the entire browser session
let sharedSocket: Socket | null = null;
let connectionCount = 0;

function getSocket(): Socket {
  if (!sharedSocket || !sharedSocket.connected) {
    const socketUrl =
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_SOCKET_URL) ||
      "http://localhost:3001";

    sharedSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    sharedSocket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Socket] Connected:", sharedSocket?.id);
      }
    });

    sharedSocket.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Socket] Disconnected:", reason);
      }
    });
  }
  return sharedSocket;
}

/**
 * Subscribe to a socket event. The listener is automatically removed on unmount.
 * The shared socket connection itself is NOT closed — it stays alive for other subscribers.
 *
 * @param event  - socket event name (e.g. "sermon:uploaded")
 * @param handler - callback function to invoke when event fires
 * @param enabled - if false, subscription is skipped (useful for conditional subscriptions)
 */
export function useSocketEvent(
  event: string,
  handler: (...args: any[]) => void,
  enabled = true
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler; // always use the latest handler without re-subscribing

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();
    connectionCount++;

    // Stable wrapper so we can remove exactly this listener on cleanup
    const stableHandler = (...args: any[]) => handlerRef.current(...args);
    socket.on(event, stableHandler);

    return () => {
      socket.off(event, stableHandler);
      connectionCount--;
      // Only fully disconnect when no subscribers remain
      if (connectionCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        connectionCount = 0;
      }
    };
  }, [event, enabled]);
}

/**
 * Get the shared socket instance directly (for emit operations)
 */
export function useSocketInstance(): Socket | null {
  useEffect(() => {
    getSocket(); // ensure socket is initialised
  }, []);
  return sharedSocket;
}
