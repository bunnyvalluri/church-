/**
 * src/realtime/socketServer.ts
 * Socket.IO Server initialization with CORS allowlist, authentication, and room management.
 */

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { isOriginAllowed } from '../config/cors';
import { authenticateSocket } from './socketAuth';
import { registerRoomHandlers } from './roomManager';
import { eventPublisher } from '../application/services/eventPublisher';
import { logger } from '../shared/logger';

let ioInstance: SocketIOServer | null = null;

export function initializeSocketIO(server: http.Server): SocketIOServer {
  if (ioInstance) return ioInstance;

  ioInstance = new SocketIOServer(server, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS origin rejected by KCM Security Policy'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.use(authenticateSocket);

  ioInstance.on('connection', (socket) => {
    logger.debug(`[SOCKET] Connected: ${socket.id} (role: ${socket.data?.user?.role})`);
    registerRoomHandlers(socket);

    socket.on('disconnect', (reason) => {
      logger.debug(`[SOCKET] Disconnected: ${socket.id} (${reason})`);
    });
  });

  // Connect Socket.IO instance to event publisher facade
  eventPublisher.setSocketEmitter(ioInstance);

  logger.info('[SOCKET] Socket.IO real-time server initialized.');
  return ioInstance;
}

export function getSocketIO(): SocketIOServer | null {
  return ioInstance;
}

