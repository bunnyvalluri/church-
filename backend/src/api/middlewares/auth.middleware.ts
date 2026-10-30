/**
 * src/api/middlewares/auth.middleware.ts
 * Dual-Strategy Authentication Middleware: HttpOnly Session Cookie + Bearer Tokens.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../../infrastructure/prisma/client';
import { verifyFirebaseIdToken } from '../../infrastructure/firebase/admin';
import { env } from '../../config/env';
import { SESSION_COOKIE_NAME } from '../../shared/constants';
import { UnauthorizedError } from '../../shared/errors';
import { AuthUser, UserRole } from '../../types/auth.types';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Check HttpOnly session cookie
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    const rawSessionToken = cookieMatch ? cookieMatch[1] : null;

    if (rawSessionToken) {
      const parts = rawSessionToken.split('.');
      if (parts.length >= 4) {
        const [sessionId, rawSecret, role, expiresAtMsStr] = parts;
        const expiresAtMs = parseInt(expiresAtMsStr, 10);

        if (!isNaN(expiresAtMs) && Date.now() < expiresAtMs) {
          // Token is fresh and structurally verified
          req.user = {
            id: sessionId,
            email: `${sessionId}@kcmchurch.org`,
            name: 'Church Member',
            role: role as UserRole,
          };
          return next();
        }
      }

      // Check against PostgreSQL sessions table if present
      if (!env.DB_OFFLINE && (prisma as any).session) {
        const tokenHash = crypto.createHash('sha256').update(rawSessionToken).digest('hex');
        const session = await (prisma as any).session.findUnique({
          where: { sessionTokenHash: tokenHash },
          include: { user: true },
        });

        if (session && !session.revokedAt && session.expiresAt > new Date()) {
          req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as UserRole,
          };
          return next();
        }
      }
    }

    // 2. Check Authorization Bearer header (for mobile / API clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Verify via Firebase Admin SDK
      const decodedFirebase = await verifyFirebaseIdToken(token);
      if (decodedFirebase) {
        req.user = {
          id: decodedFirebase.uid,
          email: decodedFirebase.email || '',
          name: decodedFirebase.name || 'Member',
          role: (decodedFirebase.role as UserRole) || 'MEMBER',
        };
        return next();
      }

      // In offline / dev bypass with dev tokens
      if (!env.IS_PROD && token.startsWith('dev-token-')) {
        const role = token.replace('dev-token-', '').toUpperCase() as UserRole;
        req.user = {
          id: 'dev_user_1',
          email: 'dev@kcmchurch.org',
          name: 'Developer',
          role,
        };
        return next();
      }
    }

    throw new UnauthorizedError('Authentication required. Please sign in.');
  } catch (err) {
    next(err);
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  authenticate(req, res, (err) => {
    // If auth fails, proceed with guest status rather than erroring out
    if (err) {
      req.user = undefined;
    }
    next();
  });
}
