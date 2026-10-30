/**
 * src/config/security.ts
 * Rate limiting thresholds, security headers, and cookie configurations.
 */

import { env } from './env';

export const securityConfig = {
  rateLimits: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 300, // limit each IP to 300 requests per windowMs
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 15, // limit each IP to 15 login attempts per 15 minutes
    },
    webhooks: {
      windowMs: 1 * 60 * 1000,
      max: 120, // limit webhook bursts
    },
    notifications: {
      windowMs: 1 * 60 * 1000,
      max: 60,
    },
  },
  cookie: {
    name: 'kcm_session',
    httpOnly: true,
    secure: env.IS_PROD,
    sameSite: (env.IS_PROD ? 'lax' : 'lax') as 'lax' | 'strict' | 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  },
};

