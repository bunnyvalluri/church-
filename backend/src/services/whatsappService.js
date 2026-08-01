/**
 * backend/src/services/whatsappService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Twilio WhatsApp notification service for KCM Ministries event alerts.
 * Uses the Twilio WhatsApp API (sandbox or approved Business number).
 *
 * IMPORTANT: For non-session messages (unsolicited), Twilio requires an
 * approved WhatsApp Message Template. The template used here must match
 * your approved template name in Twilio Console exactly.
 * For sandbox testing, free-form messages are allowed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const ACCOUNT_SID      = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN       = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_FROM    = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox default
const USE_SANDBOX      = process.env.TWILIO_WHATSAPP_SANDBOX !== 'false'; // true by default
const EVENTS_URL       = `${process.env.FRONTEND_URL || 'https://kcmchurch.vercel.app'}/#events`;

let _client = null;

function _initTwilio() {
  if (_client) return _client;

  if (!ACCOUNT_SID || ACCOUNT_SID.includes('yourAccount')) {
    console.warn('[WHATSAPP] TWILIO_ACCOUNT_SID not configured — WhatsApp disabled.');
    return null;
  }

  try {
    const twilio = require('twilio');
    _client = twilio(ACCOUNT_SID, AUTH_TOKEN);
    console.log(`[WHATSAPP] Twilio WhatsApp client initialised (${USE_SANDBOX ? 'Sandbox' : 'Production'}).`);
    return _client;
  } catch (err) {
    console.warn('[WHATSAPP] Twilio SDK not installed:', err.message);
    return null;
  }
}

/**
 * Format WhatsApp destination number.
 * Twilio requires the "whatsapp:" prefix.
 */
function _formatWhatsAppNumber(number) {
  if (!number) return null;
  const clean = String(number).replace(/\s/g, '');
  return clean.startsWith('whatsapp:') ? clean : `whatsapp:${clean}`;
}

/**
 * Format date for display.
 */
function _formatDate(dateVal) {
  if (!dateVal) return 'TBA';
  try {
    return new Date(dateVal).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Build WhatsApp message body.
 * WhatsApp allows richer formatting (bold with *text*, newlines).
 */
function _buildWhatsAppBody(member, event) {
  const date   = _formatDate(event.date);
  const branch = event.branchName || event.branch || 'All Branches';
  const name   = member.fullName ? `${member.fullName}` : 'Beloved Member';

  return [
    `✝️ *KCM Ministries Event Alert*`,
    ``,
    `Dear *${name}*, Praise God! 🙌`,
    ``,
    `A new church event has been announced:`,
    ``,
    `📌 *${event.title || 'New Event'}*`,
    ``,
    `📍 *Branch:* ${branch}`,
    `📅 *Date:* ${date}`,
    event.time     ? `⏰ *Time:* ${event.time}` : null,
    event.location ? `🏛️ *Venue:* ${event.location}` : null,
    ``,
    `🔗 View full details:`,
    `https://kcmchurch.vercel.app/#events`,
    ``,
    `_God bless you and your family!_`,
    `_— KCM Ministries Team_`,
    ``,
    `Reply *STOP* to opt out of notifications.`,
  ].filter(l => l !== null).join('\n');
}

/**
 * Send a WhatsApp event notification to a single member.
 *
 * @param {import('./sheetsService').KcmMember} member
 * @param {Object} event
 * @returns {Promise<{success: boolean, sid?: string, error?: string}>}
 */
async function sendEventWhatsApp(member, event) {
  const toNumber = member.whatsapp || member.mobile;
  if (!toNumber) {
    return { success: false, error: 'No WhatsApp/mobile number for member' };
  }

  const client = _initTwilio();
  if (!client) {
    console.log(`[WHATSAPP] Skipped (no client) — would send to: ${toNumber}`);
    return { success: false, error: 'Twilio WhatsApp client not configured' };
  }

  const toFormatted   = _formatWhatsAppNumber(toNumber);
  const messageBody   = _buildWhatsAppBody(member, event);

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: WHATSAPP_FROM,
      to:   toFormatted,
    });

    console.log(`[WHATSAPP] ✓ Sent to ${toFormatted} (SID: ${message.sid}, Status: ${message.status})`);
    return { success: true, sid: message.sid, status: message.status };

  } catch (err) {
    const errMsg = err.message || String(err);
    console.error(`[WHATSAPP] Failed for ${toFormatted}: ${errMsg} (Code: ${err.code || 'N/A'})`);

    // 63038 = Template not approved (production)
    // 63016 = Session expired (24h window) — need template
    const permanentErrors = [21211, 21212, 21614, 63038];
    const isPermanent = permanentErrors.includes(err.code);

    return { success: false, error: errMsg, errorCode: err.code, isPermanent };
  }
}

/**
 * Send WhatsApp notifications to all eligible members.
 *
 * @param {import('./sheetsService').KcmMember[]} members
 * @param {Object} event
 * @returns {Promise<{sent: number, failed: number, results: Array}>}
 */
async function sendBulkEventWhatsApp(members, event) {
  const waMembers = members.filter(m => m.whatsapp || m.mobile);
  console.log(`[WHATSAPP] Dispatching bulk WhatsApp alerts to ${waMembers.length} members...`);

  // Process in batches of 5 (WhatsApp has stricter rate limits)
  const BATCH_SIZE = 5;
  let sent = 0, failed = 0;
  const details = [];

  for (let i = 0; i < waMembers.length; i += BATCH_SIZE) {
    const batch = waMembers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(m => sendEventWhatsApp(m, event))
    );

    batchResults.forEach((r, j) => {
      const outcome = r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message };
      if (outcome.success) sent++; else failed++;
      details.push({ number: waMembers[i + j].whatsapp || waMembers[i + j].mobile, ...outcome });
    });

    // Delay between batches
    if (i + BATCH_SIZE < waMembers.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`[WHATSAPP] Bulk result — Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed, results: details };
}

module.exports = { sendEventWhatsApp, sendBulkEventWhatsApp };
