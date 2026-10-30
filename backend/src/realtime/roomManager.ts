/**
 * src/realtime/roomManager.ts
 * Role-Based Socket.IO Room Joining & Partitioning.
 */

import { Socket } from 'socket.io';
import { logger } from '../shared/logger';

const PUBLIC_ROOMS = new Set([
  'events',
  'kcm-global',
  'services',
  'sermons',
  'ngo-gallery',
  'branch:kukatpally',
  'branch:banjara-hills',
  'branch:secunderabad',
]);

const PRIVILEGED_ROOMS = new Set([
  'admin',
  'ngo:donations',
  'finance',
  'staff',
  'pastor:counseling',
]);

export function registerRoomHandlers(socket: Socket): void {
  socket.on('join', (room: string) => {
    if (!room || typeof room !== 'string') return;
    const cleanRoom = room.trim();

    // 1. Public broadcast rooms
    if (PUBLIC_ROOMS.has(cleanRoom)) {
      socket.join(cleanRoom);
      logger.debug(`[SOCKET] ${socket.id} joined public room ${cleanRoom}`);
      return;
    }

    // 2. Personal member room (e.g. member:<uid>)
    if (cleanRoom.startsWith('member:')) {
      const targetUid = cleanRoom.replace('member:', '');
      const user = socket.data?.user;
      if (
        user?.uid === targetUid ||
        ['SUPER_ADMIN', 'ADMIN', 'PASTOR'].includes(user?.role) ||
        targetUid === 'guest'
      ) {
        socket.join(cleanRoom);
        logger.debug(`[SOCKET] ${socket.id} joined personal member room ${cleanRoom}`);
      } else {
        logger.warn(`[SOCKET] Blocked unauthorized join to ${cleanRoom} from ${socket.id}`);
      }
      return;
    }

    // 3. Privileged staff and admin rooms
    if (PRIVILEGED_ROOMS.has(cleanRoom)) {
      const role = socket.data?.user?.role;
      if (['SUPER_ADMIN', 'ADMIN', 'PASTOR'].includes(role)) {
        socket.join(cleanRoom);
        logger.debug(`[SOCKET] Authorized admin client ${socket.id} joined ${cleanRoom}`);
      } else {
        logger.warn(`[SOCKET] Blocked unauthorized client ${socket.id} from joining privileged room ${cleanRoom}`);
      }
      return;
    }

    logger.warn(`[SOCKET] Blocked unrecognized room join attempt: ${cleanRoom}`);
  });
}

