/**
 * backend/src/services/fcmService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Cloud Messaging (FCM) push notification service.
 * Uses Firebase Admin SDK to send multicast push notifications to all
 * registered device tokens stored in the PostgreSQL `device_tokens` table.
 *
 * Auth: FIREBASE_ADMIN_SERVICE_ACCOUNT (base64 encoded service account JSON)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const SERVICE_ACCOUNT_B64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
const FCM_TOPIC           = process.env.FIREBASE_FCM_TOPIC || 'kcm-events';
const FRONTEND_URL        = process.env.FRONTEND_URL || 'https://kcmchurch.vercel.app';
const EVENTS_URL          = `${FRONTEND_URL}/#events`;

let _firebaseApp  = null;
let _messaging    = null;

/**
 * Lazily initialise Firebase Admin SDK.
 */
function _initFirebase() {
  if (_messaging) return _messaging;

  if (!SERVICE_ACCOUNT_B64) {
    console.warn('[FCM] FIREBASE_ADMIN_SERVICE_ACCOUNT not configured — push notifications disabled.');
    return null;
  }

  try {
    const admin = require('firebase-admin');

    if (admin.apps.length > 0) {
      _firebaseApp = admin.apps[0];
    } else {
      const serviceAccount = JSON.parse(
        Buffer.from(SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      );
      _firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    _messaging = admin.messaging(_firebaseApp);
    console.log('[FCM] Firebase Admin SDK initialised.');
    return _messaging;

  } catch (err) {
    console.warn('[FCM] Firebase Admin SDK initialisation failed:', err.message);
    return null;
  }
}

/**
 * Build the FCM notification payload for an event.
 */
function _buildFcmPayload(event) {
  const date   = event.date ? new Date(event.date).toLocaleDateString('en-IN') : 'TBA';
  const branch = event.branchName || event.branch || 'All Branches';

  return {
    notification: {
      title: '✝️ New Church Event',
      body:  `${event.title || 'A new event has been uploaded'} — ${date}`,
    },
    data: {
      type:       'NEW_EVENT',
      event_id:   String(event.id || ''),
      event_title: String(event.title || ''),
      event_date: String(date),
      branch:     String(branch),
      event_link: `${FRONTEND_URL}/#events`,
      timestamp:  new Date().toISOString(),
    },
    android: {
      priority: 'high',
      notification: {
        channelId:   'kcm_events',
        color:       '#7c3aed',
        icon:        'ic_notification',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: 'default',
          category: 'NEW_EVENT',
        },
      },
    },
    webpush: {
      notification: {
        icon:  `${FRONTEND_URL}/icons/icon-192x192.png`,
        badge: `${FRONTEND_URL}/icons/badge-72x72.png`,
        actions: [
          { action: 'view_event', title: 'View Event' },
          { action: 'dismiss',    title: 'Dismiss' },
        ],
      },
      fcmOptions: {
        link: `${FRONTEND_URL}/#events`,
      },
    },
  };
}

/**
 * Send push notification to all device tokens in the database.
 *
 * @param {Object} event  – Prisma Event record
 * @param {Object} [prismaClient] – Optional Prisma client (uses new one if not provided)
 * @returns {Promise<{sent: number, failed: number, tokensRemoved: number}>}
 */
async function sendEventPushNotification(event, prismaClient = null) {
  const messaging = _initFirebase();
  if (!messaging) {
    console.log('[FCM] Skipped — Firebase not configured.');
    return { sent: 0, failed: 0, tokensRemoved: 0 };
  }

  let prisma = prismaClient;
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }

  let tokens = [];
  try {
    const records = await prisma.deviceToken.findMany({
      select: { id: true, token: true, userId: true },
      take: 1000, // Max batch size per FCM multicast
    });
    tokens = records;
  } catch (err) {
    console.warn('[FCM] Could not fetch device tokens:', err.message);
    return { sent: 0, failed: 0, tokensRemoved: 0 };
  }

  if (tokens.length === 0) {
    console.log('[FCM] No device tokens registered — skipping push.');
    return { sent: 0, failed: 0, tokensRemoved: 0 };
  }

  console.log(`[FCM] Sending push to ${tokens.length} device tokens...`);

  const payload        = _buildFcmPayload(event);
  const tokenStrings   = tokens.map(t => t.token);

  // FCM multicast allows max 500 tokens per batch
  const BATCH_SIZE = 500;
  let totalSent = 0, totalFailed = 0;
  const invalidTokenIds = [];

  for (let i = 0; i < tokenStrings.length; i += BATCH_SIZE) {
    const batch      = tokenStrings.slice(i, i + BATCH_SIZE);
    const batchMeta  = tokens.slice(i, i + BATCH_SIZE);

    try {
      const response = await messaging.sendEachForMulticast({
        ...payload,
        tokens: batch,
      });

      totalSent   += response.successCount;
      totalFailed += response.failureCount;

      // Collect invalid tokens for cleanup
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code || '';
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokenIds.push(batchMeta[idx].id);
          }
        }
      });

    } catch (err) {
      console.error(`[FCM] Multicast batch error (offset ${i}):`, err.message);
      totalFailed += batch.length;
    }
  }

  // Clean up invalid tokens
  let tokensRemoved = 0;
  if (invalidTokenIds.length > 0) {
    try {
      const { count } = await prisma.deviceToken.deleteMany({
        where: { id: { in: invalidTokenIds } },
      });
      tokensRemoved = count;
      console.log(`[FCM] Removed ${tokensRemoved} invalid/expired device tokens.`);
    } catch (err) {
      console.warn('[FCM] Token cleanup error:', err.message);
    }
  }

  console.log(`[FCM] Push result — Sent: ${totalSent}, Failed: ${totalFailed}, Removed: ${tokensRemoved}`);
  return { sent: totalSent, failed: totalFailed, tokensRemoved };
}

/**
 * Send push notification to a topic (all subscribers of `kcm-events`).
 * Useful as a fast broadcast fallback.
 *
 * @param {Object} event
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendTopicPushNotification(event) {
  const messaging = _initFirebase();
  if (!messaging) {
    return { success: false, error: 'Firebase not configured' };
  }

  const payload = _buildFcmPayload(event);

  try {
    const messageId = await messaging.send({
      ...payload,
      topic: FCM_TOPIC,
    });

    console.log(`[FCM] ✓ Topic push sent to "${FCM_TOPIC}" (messageId: ${messageId})`);
    return { success: true, messageId };

  } catch (err) {
    console.error('[FCM] Topic push failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Register a new FCM device token for a user.
 *
 * @param {Object} params
 * @param {string} params.token
 * @param {string} [params.userId]
 * @param {string} [params.deviceType]  – 'web' | 'android' | 'ios'
 * @param {string} [params.platform]
 * @param {Object} prismaClient
 * @returns {Promise<Object>}
 */
async function registerDeviceToken({ token, userId, deviceType, platform }, prismaClient) {
  if (!token) throw new Error('Device token is required.');

  const prisma = prismaClient;
  try {
    const record = await prisma.deviceToken.upsert({
      where:  { token },
      update: { lastUsedAt: new Date(), userId: userId || null, deviceType, platform },
      create: { token, userId: userId || null, deviceType, platform },
    });
    console.log(`[FCM] Device token registered/updated: ${token.substring(0, 20)}...`);
    return record;
  } catch (err) {
    console.error('[FCM] Token registration failed:', err.message);
    throw err;
  }
}

module.exports = {
  sendEventPushNotification,
  sendTopicPushNotification,
  registerDeviceToken,
};
