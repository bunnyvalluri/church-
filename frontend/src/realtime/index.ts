/**
 * src/realtime/index.ts
 * Real-time Socket.IO client interface for KCM Church.
 */

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getRealtimeSocket(): Socket {
  if (typeof window === 'undefined') {
    return {} as Socket;
  }

  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socketInstance;
}

export function subscribeToChurchRoom(room: string): void {
  const socket = getRealtimeSocket();
  if (socket.connected) {
    socket.emit('subscribe', { room });
  } else {
    socket.once('connect', () => {
      socket.emit('subscribe', { room });
    });
  }
}

