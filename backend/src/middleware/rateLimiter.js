/**
 * backend/src/middleware/rateLimiter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rate limiting middleware using express-rate-limit.
 * Provides different limiters for public endpoints vs webhook endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const WINDOW_MS  = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
const MAX_PUBLIC = parseInt(process.env.RATE_LIMIT_MAX       || '100',    10);

/**
 * Standard rate limiter for general API endpoints.
 * 100 requests per 15 minutes per IP.
 */
let generalLimiter;
let webhookLimiter;
let notificationLimiter;

try {
  const rateLimit = require('express-rate-limit');

  /** General API: 100 req / 15 min */
  generalLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max:      MAX_PUBLIC,
    standardHeaders: true,
    legacyHeaders:   false,
    message: {
      error:   'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
    },
    keyGenerator: (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    },
    skip: (req) => {
      // Skip rate limit for health checks
      return req.path === '/health';
    },
  });

  /** Webhook endpoints: 10 req / min — stricter */
  webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max:      10,
    standardHeaders: true,
    legacyHeaders:   false,
    message: {
      error:   'Too Many Webhook Calls',
      message: 'Webhook rate limit exceeded.',
    },
  });

  /** Notification dispatch: 5 req / 5 min — very strict to prevent spam */
  notificationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max:      5,
    standardHeaders: true,
    legacyHeaders:   false,
    message: {
      error:   'Notification Rate Limit',
      message: 'Too many notification dispatch requests. Please wait before sending again.',
    },
  });

  console.log('[RATE_LIMITER] Rate limiting middleware initialised.');

} catch (err) {
  console.warn('[RATE_LIMITER] express-rate-limit not installed — rate limiting disabled:', err.message);

  // No-op middleware fallback
  const noop = (req, res, next) => next();
  generalLimiter      = noop;
  webhookLimiter      = noop;
  notificationLimiter = noop;
}

module.exports = { generalLimiter, webhookLimiter, notificationLimiter };
