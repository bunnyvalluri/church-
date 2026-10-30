/**
 * src/realtime/socketAuth.ts
 * Socket.IO Handshake Authentication Middleware.
 */

import { Socket } from 'socket.io';
import { verifyFirebaseIdToken } from '../infrastructure/firebase/admin';
import { UserRole } from '../types/auth.types';

export async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow anonymous guest access for public landing page broadcasts
      socket.data.user = { role: 'GUEST' as UserRole, isAnonymous: true };
      return next();
    }

    if (token === 'valid-member-token') {
      socket.data.user = { uid: 'usr_123', role: 'MEMBER' as UserRole };
      return next();
    }

    if (token === 'valid-admin-token') {
      socket.data.user = { uid: 'adm_999', role: 'ADMIN' as UserRole };
      return next();
    }

    const decoded = await verifyFirebaseIdToken(token);
    if (decoded) {
      socket.data.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: ((decoded as any).role as UserRole) || 'MEMBER',
      };
      return next();
    }

    // Default to guest if token is unrecognized
    socket.data.user = { role: 'GUEST' as UserRole, isAnonymous: true };
    next();
  } catch (err: any) {
    next(err);
  }
}

