/**
 * backend/src/services/notificationDispatcher.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central orchestration service for KCM event notifications.
 *
 * Flow:
 * 1. Fetch all member records from Google Sheets (KCM Members Database)
 * 2. Fan-out to 4 parallel notification channels:
 *    a. Email  (Resend)
 *    b. SMS    (Twilio)
 *    c. WhatsApp (Twilio WhatsApp)
 *    d. Push   (Firebase FCM — device tokens from PostgreSQL)
 * 3. Log each delivery attempt to `NotificationLog` table
 * 4. Create retry jobs in `EventNotificationRetryJob` for failed sends
 * 5. Record an `EventNotification` row linking event + channels used
 * 6. Trigger Google Apps Script webhook (async, non-blocking)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { getMembers }                = require('./sheetsService');
const { sendBulkEventEmails }       = require('./emailService');
const { sendBulkEventSMS }          = require('./smsService');
const { sendBulkEventWhatsApp }     = require('./whatsappService');
const { sendEventPushNotification } = require('./fcmService');
const { logAuditEvent }             = require('./auditLogger');

const https = require('https');
const http  = require('http');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GOOGLE_SCRIPT_URL  = process.env.GOOGLE_SCRIPT_WEBHOOK_URL;
const GOOGLE_WH_SECRET   = process.env.GOOGLE_WEBHOOK_SECRET || 'kcm_google_webhook_secret';
const FRONTEND_URL        = process.env.FRONTEND_URL || 'https://kcmchurch.vercel.app';
const EVENTS_URL          = `${FRONTEND_URL}/#events`;

// ── Notification channel filter helpers ──────────────────────────────────────

/** Filter members who opted in to a specific channel (or have no pref = all). */
function _filterByChannel(members, channel) {
  return members.filter(m => {
    if (!m.notificationPrefs || m.notificationPrefs.length === 0) return true; // No pref = all
    return m.notificationPrefs.some(p => p.toLowerCase() === channel.toLowerCase());
  });
}

// ── Google Apps Script Webhook Trigger ───────────────────────────────────────

/**
 * Trigger Google Apps Script webhook (non-blocking).
 * Script handles GmailApp bulk sending as a supplementary email channel.
 *
 * @param {Object} event
 */
function _triggerGoogleAppsScript(event) {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('[DISPATCHER] GOOGLE_SCRIPT_WEBHOOK_URL not set — Apps Script webhook skipped.');
    return;
  }

  const payload = JSON.stringify({
    secret:           GOOGLE_WH_SECRET,
    event_title:      event.title || '',
    event_branch:     event.branchName || event.branch || 'All Branches',
    event_date:       event.date ? new Date(event.date).toISOString() : '',
    event_description: event.description || '',
    event_link:       `${FRONTEND_URL}/#events`,
  });

  const url    = new URL(GOOGLE_SCRIPT_URL);
  const client = url.protocol === 'https:' ? https : http;

  const req = client.request(
    {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (res) => {
      console.log(`[DISPATCHER] Google Apps Script webhook: HTTP ${res.statusCode}`);
    }
  );

  req.on('error', (err) => {
    console.warn('[DISPATCHER] Google Apps Script webhook error:', err.message);
  });

  req.write(payload);
  req.end();
}

// ── Notification Log Writer ───────────────────────────────────────────────────

/**
 * Write a NotificationLog entry to the database.
 */
async function _writeNotificationLog({ eventId, channel, status, recipientAddr, errorMessage }) {
  try {
    if (prisma.notificationLog) {
      await prisma.notificationLog.create({
        data: {
          channel,
          status,
          recipient_addr: recipientAddr || 'bulk',
          errorMessage:   status === 'FAILED' ? errorMessage : null,
          deliveredAt:    status === 'SENT' ? new Date() : null,
          sentAt:         new Date(),
        },
      });
    }
  } catch (err) {
    console.warn(`[DISPATCHER] NotificationLog write note (${channel}):`, err.message?.split('\n')[0]);
  }
}

// ── Retry Job Creator ────────────────────────────────────────────────────────

/**
 * Create retry jobs for failed notification sends.
 * Uses the EventNotificationRetryJob model (added to schema).
 */
async function _createRetryJobs(eventId, channel, failedResults) {
  const failedWithAddr = failedResults.filter(r => !r.success && !r.isPermanent);

  if (failedWithAddr.length === 0) return;

  try {
    // Use the DonationRetryJob table pattern (already exists) if EventNotificationRetryJob
    // hasn't been migrated yet — graceful degradation
    const modelExists = !!prisma.eventNotificationRetryJob;

    if (modelExists) {
      await prisma.eventNotificationRetryJob.createMany({
        data: failedWithAddr.map(r => ({
          eventId,
          memberEmail:  r.email  || null,
          channel,
          status:       'PENDING',
          attempts:     0,
          maxAttempts:  3,
          nextRetryAt:  new Date(Date.now() + 5 * 60 * 1000), // 5 min
          lastError:    r.error  || 'Unknown error',
          payload:      JSON.stringify({ address: r.email || r.mobile || r.number }),
        })),
        skipDuplicates: true,
      });
      console.log(`[DISPATCHER] Created ${failedWithAddr.length} retry jobs for channel ${channel}.`);
    }
  } catch (err) {
    console.warn(`[DISPATCHER] Retry job creation note (${channel}):`, err.message);
  }
}

// ── Main Dispatcher ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} DispatchResult
 * @property {string} eventId
 * @property {Object} email
 * @property {Object} sms
 * @property {Object} whatsapp
 * @property {Object} push
 * @property {number} totalMembersNotified
 * @property {number} durationMs
 */

/**
 * Dispatch event notifications across all channels.
 *
 * @param {Object}  event          – Prisma Event record (must have id, title, date, branch fields)
 * @param {Object}  [options]
 * @param {string}  [options.branch]   – Limit notifications to a specific branch
 * @param {boolean} [options.emailEnabled]    – default: true
 * @param {boolean} [options.smsEnabled]      – default: true
 * @param {boolean} [options.whatsappEnabled] – default: true
 * @param {boolean} [options.pushEnabled]     – default: true
 * @returns {Promise<DispatchResult>}
 */
async function dispatchEventNotification(event, options = {}) {
  const startTime = Date.now();
  const {
    branch          = null,
    emailEnabled    = true,
    smsEnabled      = true,
    whatsappEnabled = true,
    pushEnabled     = true,
  } = options;

  console.log(`[DISPATCHER] ════════════════════════════════════════════`);
  console.log(`[DISPATCHER] Starting notification dispatch for event: "${event.title}"`);
  console.log(`[DISPATCHER] Event ID: ${event.id} | Branch filter: ${branch || 'ALL'}`);
  console.log(`[DISPATCHER] ════════════════════════════════════════════`);

  // 1. Fetch members from Google Sheets
  const allMembers = await getMembers({ branch });
  console.log(`[DISPATCHER] Loaded ${allMembers.length} eligible members from Google Sheets.`);

  const results = {
    eventId:               event.id,
    email:                 { sent: 0, failed: 0, skipped: !emailEnabled },
    sms:                   { sent: 0, failed: 0, skipped: !smsEnabled },
    whatsapp:              { sent: 0, failed: 0, skipped: !whatsappEnabled },
    push:                  { sent: 0, failed: 0, skipped: !pushEnabled, tokensRemoved: 0 },
    totalMembersNotified:  0,
    durationMs:            0,
  };

  // 2. Fan-out to all channels in parallel
  const channelPromises = [];

  // 2a. Email
  if (emailEnabled) {
    const emailMembers = _filterByChannel(allMembers, 'Email');
    channelPromises.push(
      sendBulkEventEmails(emailMembers, event)
        .then(r => {
          results.email = r;
          _writeNotificationLog({ eventId: event.id, channel: 'EMAIL', status: r.failed === 0 ? 'SENT' : 'PARTIAL', recipientAddr: 'bulk_email' });
          if (r.failed > 0 && r.results) _createRetryJobs(event.id, 'EMAIL', r.results);
          console.log(`[DISPATCHER] Email channel: ${r.sent} sent, ${r.failed} failed.`);
        })
        .catch(err => {
          console.error('[DISPATCHER] Email channel error:', err.message);
          _writeNotificationLog({ eventId: event.id, channel: 'EMAIL', status: 'FAILED', errorMessage: err.message });
        })
    );
  }

  // 2b. SMS
  if (smsEnabled) {
    const smsMembers = _filterByChannel(allMembers, 'SMS');
    channelPromises.push(
      sendBulkEventSMS(smsMembers, event)
        .then(r => {
          results.sms = r;
          _writeNotificationLog({ eventId: event.id, channel: 'SMS', status: r.failed === 0 ? 'SENT' : 'PARTIAL', recipientAddr: 'bulk_sms' });
          if (r.failed > 0 && r.results) _createRetryJobs(event.id, 'SMS', r.results);
          console.log(`[DISPATCHER] SMS channel: ${r.sent} sent, ${r.failed} failed.`);
        })
        .catch(err => {
          console.error('[DISPATCHER] SMS channel error:', err.message);
          _writeNotificationLog({ eventId: event.id, channel: 'SMS', status: 'FAILED', errorMessage: err.message });
        })
    );
  }

  // 2c. WhatsApp
  if (whatsappEnabled) {
    const waMembers = _filterByChannel(allMembers, 'WhatsApp');
    channelPromises.push(
      sendBulkEventWhatsApp(waMembers, event)
        .then(r => {
          results.whatsapp = r;
          _writeNotificationLog({ eventId: event.id, channel: 'WHATSAPP', status: r.failed === 0 ? 'SENT' : 'PARTIAL', recipientAddr: 'bulk_whatsapp' });
          if (r.failed > 0 && r.results) _createRetryJobs(event.id, 'WHATSAPP', r.results);
          console.log(`[DISPATCHER] WhatsApp channel: ${r.sent} sent, ${r.failed} failed.`);
        })
        .catch(err => {
          console.error('[DISPATCHER] WhatsApp channel error:', err.message);
          _writeNotificationLog({ eventId: event.id, channel: 'WHATSAPP', status: 'FAILED', errorMessage: err.message });
        })
    );
  }

  // 2d. Firebase FCM Push
  if (pushEnabled) {
    channelPromises.push(
      sendEventPushNotification(event, prisma)
        .then(r => {
          results.push = r;
          _writeNotificationLog({ eventId: event.id, channel: 'PUSH', status: r.sent > 0 ? 'SENT' : 'SKIPPED', recipientAddr: 'fcm_tokens' });
          console.log(`[DISPATCHER] Push channel: ${r.sent} sent, ${r.failed} failed.`);
        })
        .catch(err => {
          console.error('[DISPATCHER] Push channel error:', err.message);
          _writeNotificationLog({ eventId: event.id, channel: 'PUSH', status: 'FAILED', errorMessage: err.message });
        })
    );
  }

  // Wait for all channels
  await Promise.allSettled(channelPromises);

  // 3. Trigger Google Apps Script (non-blocking)
  _triggerGoogleAppsScript(event);

  // 4. Record EventNotification summary
  const channelList = [
    emailEnabled    ? 'EMAIL'    : null,
    smsEnabled      ? 'SMS'      : null,
    whatsappEnabled ? 'WHATSAPP' : null,
    pushEnabled     ? 'PUSH'     : null,
  ].filter(Boolean);

  try {
    if (prisma.eventNotification) {
      await prisma.eventNotification.create({
        data: {
          eventId: event.id,
          type:    'NEW_EVENT',
          title:   `New Event: ${event.title}`,
          content: `Event "${event.title}" notifications dispatched to ${allMembers.length} members.`,
          channels: channelList,
        },
      });
    }
  } catch (err) {
    console.warn('[DISPATCHER] EventNotification record note:', err.message);
  }

  // 5. Audit log
  const durationMs = Date.now() - startTime;
  results.durationMs            = durationMs;
  results.totalMembersNotified  = allMembers.length;

  await logAuditEvent({
    action:   'EVENT_NOTIFICATION_DISPATCHED',
    entity:   'EVENT',
    entityId: event.id,
    details: {
      email:    results.email,
      sms:      results.sms,
      whatsapp: results.whatsapp,
      push:     results.push,
      members:  allMembers.length,
      durationMs,
    },
    severity: 'INFO',
    loopName: 'Notification Dispatcher',
  }).catch(() => {});

  console.log(`[DISPATCHER] ════ Dispatch complete in ${durationMs}ms ════`);
  console.log(`[DISPATCHER] Members: ${allMembers.length} | Email: ${results.email.sent} | SMS: ${results.sms.sent} | WhatsApp: ${results.whatsapp.sent} | Push: ${results.push.sent}`);

  return results;
}

module.exports = { dispatchEventNotification };
