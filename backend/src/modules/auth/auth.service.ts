/**
 * src/modules/auth/auth.service.ts
 * Authentication service handling Google GIS, local sessions, and credentials.
 */

import crypto from 'crypto';
import { prisma } from '../../infrastructure/prisma/client';
import { verifyGoogleIdToken } from '../../infrastructure/google/gis';
import { env } from '../../config/env';
import { UnauthorizedError, BadRequestError } from '../../shared/errors';
import { AuthUser, UserRole } from '../../types/auth.types';

export class AuthService {
  public async verifyGoogleLogin(idToken: string): Promise<{ user: AuthUser; sessionToken: string }> {
    const googlePayload = await verifyGoogleIdToken(idToken);
    const email = googlePayload.email.toLowerCase();

    // Find or create member in database
    let user = env.DB_OFFLINE
      ? null
      : await prisma.user.findUnique({ where: { email } });

    if (!user && !env.DB_OFFLINE) {
      user = await prisma.user.create({
        data: {
          email,
          name: googlePayload.name,
          image: googlePayload.picture || null,
          role: 'MEMBER',
          password: crypto.randomBytes(32).toString('hex'), // Unusable password for OAuth users
        },
      });
    }

    const authUser: AuthUser = {
      id: user?.id || `usr_google_${googlePayload.sub}`,
      email,
      name: user?.name || googlePayload.name,
      role: (user?.role as UserRole) || 'MEMBER',
    };

    const sessionToken = this.createSessionToken(authUser);
    return { user: authUser, sessionToken };
  }

  public createSessionToken(user: AuthUser): string {
    const sessionId = user.id;
    const rawSecret = crypto.randomBytes(16).toString('hex');
    const role = user.role;
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    const payload = `${sessionId}.${rawSecret}.${role}.${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', env.SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    return `${payload}.${signature}`;
  }
}

export const authService = new AuthService();

