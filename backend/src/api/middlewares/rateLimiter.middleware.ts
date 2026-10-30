/**
 * src/api/middlewares/rateLimiter.middleware.ts
 * Tiered Rate Limiting middleware protecting sensitive auth, donation, and notification routes.
 */

import rateLimit from 'express-rate-limit';
import { securityConfig } from '../../config/security';

export const generalLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.general.windowMs,
  max: securityConfig.rateLimits.general.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again in 15 minutes.',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.auth.windowMs,
  max: securityConfig.rateLimits.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    },
  },
});

export const webhookLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.webhooks.windowMs,
  max: securityConfig.rateLimits.webhooks.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
      message: 'Webhook burst limit exceeded.',
    },
  },
});

export const notificationLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.notifications.windowMs,
  max: securityConfig.rateLimits.notifications.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'NOTIFICATION_RATE_LIMIT_EXCEEDED',
      message: 'Notification rate limit exceeded. Please throttle requests.',
    },
  },
});

