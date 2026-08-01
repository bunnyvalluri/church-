/**
 * backend/src/services/smsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Twilio SMS notification service for KCM Ministries event alerts.
 * Sends templated SMS messages to members who opted in to SMS notifications.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER  = process.env.TWILIO_FROM_NUMBER;
const EVENTS_URL   = `${process.env.FRONTEND_URL || 'https://kcmchurch.vercel.app'}/#events`;

let _client = null;

function _initTwilio() {
  if (_client) return _client;

  if (!ACCOUNT_SID || ACCOUNT_SID.includes('yourAccount')) {
    console.warn('[SMS] TWILIO_ACCOUNT_SID not configured — SMS notifications disabled.');
    return null;
  }
  if (!AUTH_TOKEN || AUTH_TOKEN.includes('yourAuth')) {
    console.warn('[SMS] TWILIO_AUTH_TOKEN not configured — SMS notifications disabled.');
    return null;
  }

  try {
    const twilio = require('twilio');
    _client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    console.log('[SMS] Twilio client initialised.');
    return _client;
  } catch (err) {
    console.warn('[SMS] Twilio SDK not installed:', err.message);
    return null;
  }
}

/**
 * Format the event date for SMS (concise).
 */
function _formatDate(dateVal) {
  if (!dateVal) return 'TBA';
  try {
    return new Date(dateVal).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Build SMS message body (under 160 chars for single segment when possible).
 */
function _buildSmsBody(event) {
  const date   = _formatDate(event.date);
  const branch = event.branchName || event.branch || 'All Branches';
  const title  = (event.title || 'New Event').substring(0, 50);

  return [
    `KCM Ministries:`,
    `New Event Added!`,
    `📅 ${title}`,
    `📍 ${branch}`,
    `🗓 ${date}`,
    `View: kcmchurch.vercel.app/#events`,
    `Reply STOP to opt out.`,
  ].join('\n');
}

/**
 * Send an SMS event notification to a single member.
 *
 * @param {import('./sheetsService').KcmMember} member
 * @param {Object} event
 * @returns {Promise<{success: boolean, sid?: string, error?: string}>}
 */
async function sendEventSMS(member, event) {
  if (!member.mobile) {
    return { success: false, error: 'No mobile number for member' };
  }

  const client = _initTwilio();
  if (!client) {
    console.log(`[SMS] Skipped (no client) — would send to: ${member.mobile}`);
    return { success: false, error: 'Twilio client not configured' };
  }

  const messageBody = _buildSmsBody(event);

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: FROM_NUMBER,
      to:   member.mobile,
    });

    console.log(`[SMS] ✓ Sent to ${member.mobile} (SID: ${message.sid}, Status: ${message.status})`);
    return { success: true, sid: message.sid, status: message.status };

  } catch (err) {
    // Twilio error codes: https://www.twilio.com/docs/api/errors
    const errMsg = err.message || String(err);
    console.error(`[SMS] Failed for ${member.mobile}: ${errMsg} (Code: ${err.code || 'N/A'})`);

    // Identify non-retryable errors
    const permanentErrors = [21211, 21212, 21614, 21408]; // Invalid number, unsubscribed
    const isPermanent = permanentErrors.includes(err.code);

    return { success: false, error: errMsg, errorCode: err.code, isPermanent };
  }
}

/**
 * Send SMS event notifications to all eligible members.
 *
 * @param {import('./sheetsService').KcmMember[]} members
 * @param {Object} event
 * @returns {Promise<{sent: number, failed: number, results: Array}>}
 */
async function sendBulkEventSMS(members, event) {
  const smsMembers = members.filter(m => m.mobile);
  console.log(`[SMS] Dispatching bulk event SMS to ${smsMembers.length} members...`);

  // Process in batches of 10 to avoid Twilio rate limits
  const BATCH_SIZE = 10;
  let sent = 0, failed = 0;
  const details = [];

  for (let i = 0; i < smsMembers.length; i += BATCH_SIZE) {
    const batch = smsMembers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(m => sendEventSMS(m, event))
    );

    batchResults.forEach((r, j) => {
      const outcome = r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message };
      if (outcome.success) sent++; else failed++;
      details.push({ mobile: batch[j].mobile, ...outcome });
    });

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < smsMembers.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`[SMS] Bulk result — Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed, results: details };
}

module.exports = { sendEventSMS, sendBulkEventSMS };
