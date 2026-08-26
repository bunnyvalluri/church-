/**
 * backend/src/services/smsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SMS notification service for KCM Ministries event alerts.
 * Upgraded to use production httpSMS delivery engine with outbox queueing,
 * rate limiting, and Twilio fallback compatibility.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { getSMSService } = require('../modules/notifications/sms/sms.service');
const { renderSmsTemplate } = require('../modules/notifications/sms/sms.templates');

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
 * Send an SMS event notification to a single member via production SMS engine.
 *
 * @param {import('./sheetsService').KcmMember | Object} member
 * @param {Object} event
 * @returns {Promise<{success: boolean, sid?: string, messageId?: string, error?: string}>}
 */
async function sendEventSMS(member, event) {
  const phone = member.mobile || member.phone;
  if (!phone) {
    return { success: false, error: 'No mobile number for member' };
  }

  const smsService = getSMSService();
  const body = renderSmsTemplate('EVENT_CREATED', {
    title: event.title,
    date: event.date || event.event_date,
    time: event.time || event.event_time,
    location: event.location,
    branch: event.branchName || event.branch,
  });

  const memberId = member.id || (member.sheetRowIndex ? `sheet_${member.sheetRowIndex}` : undefined);
  const idempotencyKey = `event-${event.id || 'evt'}-${memberId || phone}-legacy`;

  const result = await smsService.sendSingleSMS({
    to: phone,
    message: body,
    memberId: member.id || undefined,
    notificationId: event.id || undefined,
    idempotencyKey,
    category: 'events',
    metadata: { eventId: event.id, eventTitle: event.title },
  });

  return {
    success: result.success,
    messageId: result.messageId,
    sid: result.messageId,
    error: result.error,
  };
}

/**
 * Send SMS event notifications to all eligible members.
 *
 * @param {import('./sheetsService').KcmMember[]} members
 * @param {Object} event
 * @returns {Promise<{sent: number, failed: number, results: Array}>}
 */
async function sendBulkEventSMS(members, event) {
  const smsService = getSMSService();
  const res = await smsService.sendEventSMS(event, members, { isUpdate: false });
  return {
    sent: res.enqueued,
    failed: res.skipped,
    results: [],
  };
}

module.exports = {
  sendEventSMS,
  sendBulkEventSMS,
};
