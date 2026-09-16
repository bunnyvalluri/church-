/**
 * backend/src/middleware/webhookVerify.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Webhook signature verification middleware.
 * Validates incoming webhook requests from:
 *   - Google Apps Script (X-KCM-Webhook-Secret header)
 *   - Twilio (X-Twilio-Signature header)
 *   - Internal service calls (Authorization: Bearer)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

function getGoogleWebhookSecret() {
  const secret = process.env.GOOGLE_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[WEBHOOK_VERIFY] CRITICAL: GOOGLE_WEBHOOK_SECRET not set in production.');
      return null;
    }
    return 'kcm_google_webhook_secret';
  }
  return secret;
}

function getInternalServiceToken() {
  const token = process.env.INTERNAL_SERVICE_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[WEBHOOK_VERIFY] CRITICAL: INTERNAL_SERVICE_TOKEN not set in production.');
      return null;
    }
    return 'kcm_internal_service_token';
  }
  return token;
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Middleware: Verify Google Apps Script webhook secret.
 * Checks `X-KCM-Webhook-Secret` header or `secret` in JSON body.
 */
function verifyGoogleWebhook(req, res, next) {
  const headerSecret = req.headers['x-kcm-webhook-secret'];
  const bodySecret   = req.body && req.body.secret;
  const secret       = headerSecret || bodySecret;
  const expectedSecret = getGoogleWebhookSecret();

  if (!expectedSecret || !secret || !safeCompare(secret, expectedSecret)) {
    console.warn(`[WEBHOOK_VERIFY] Unauthorized Google webhook attempt from ${req.ip}`);
    return res.status(401).json({
      error:   'Unauthorized',
      message: 'Invalid or missing webhook secret.',
    });
  }

  console.log(`[WEBHOOK_VERIFY] Google webhook verified from ${req.ip}`);
  next();
}

/**
 * Middleware: Verify internal service-to-service calls.
 * Checks `Authorization: Bearer <INTERNAL_SERVICE_TOKEN>` header.
 */
function verifyInternalToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token      = authHeader.replace(/^Bearer\s+/i, '').trim();
  const expectedToken = getInternalServiceToken();

  if (!expectedToken || !token || !safeCompare(token, expectedToken)) {
    console.warn(`[WEBHOOK_VERIFY] Unauthorized internal call from ${req.ip}`);
    return res.status(401).json({
      error:   'Unauthorized',
      message: 'Invalid or missing service token.',
    });
  }

  next();
}

/**
 * Middleware: Verify Twilio webhook signatures.
 * Uses X-Twilio-Signature header validation via Twilio's SDK.
 */
function verifyTwilioWebhook(req, res, next) {
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

  if (!TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN.includes('yourAuth')) {
    // Twilio not configured — allow through (dev mode)
    return next();
  }

  try {
    const twilio = require('twilio');
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const isValid = twilio.validateRequest(
      TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      req.body
    );

    if (!isValid) {
      console.warn(`[WEBHOOK_VERIFY] Invalid Twilio signature from ${req.ip}`);
      return res.status(403).json({ error: 'Invalid Twilio signature' });
    }

    next();
  } catch (err) {
    // If twilio package not installed, pass through with warning
    console.warn('[WEBHOOK_VERIFY] Twilio signature check skipped:', err.message);
    next();
  }
}

/**
 * Middleware factory: Allow request only from specific allowed origins.
 * Use for webhook endpoints to restrict access.
 *
 * @param {string[]} allowedOrigins
 */
function allowOrigins(allowedOrigins = []) {
  return (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer || '';
    if (allowedOrigins.length > 0 && !allowedOrigins.some(o => origin.startsWith(o))) {
      console.warn(`[WEBHOOK_VERIFY] Blocked origin: ${origin}`);
      return res.status(403).json({ error: 'Forbidden origin' });
    }
    next();
  };
}

module.exports = {
  verifyGoogleWebhook,
  verifyInternalToken,
  verifyTwilioWebhook,
  allowOrigins,
};
