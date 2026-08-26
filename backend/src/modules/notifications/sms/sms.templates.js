/**
 * backend/src/modules/notifications/sms/sms.templates.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamic church SMS message template definitions and variable interpolation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { sanitizeMessageContent } = require('./sms.validation');

/**
 * Format a Date object for clear, concise SMS display.
 * @param {Date | string | number} dateVal
 * @returns {string}
 */
function formatSmsDate(dateVal) {
  if (!dateVal) return 'TBA';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Replace placeholders like `{{key}}` in template string with variable values.
 * @param {string} template
 * @param {Record<string, any>} variables
 * @returns {string}
 */
function interpolate(template, variables = {}) {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : '';
  });
}

const SMS_TEMPLATES = {
  /**
   * New event published notification
   */
  EVENT_CREATED: (data) => {
    const title = data.title || 'Church Service';
    const date = formatSmsDate(data.date);
    const time = data.time || '9:00 AM';
    const location = data.location || data.branch || 'KCM Central Church';
    const link = data.link || 'kcmchurch.vercel.app/#events';

    return sanitizeMessageContent(
      `KCM Ministries: New Event Scheduled!\n` +
      `📅 ${title}\n` +
      `🗓 ${date} at ${time}\n` +
      `📍 ${location}\n` +
      `Details: ${link}\n` +
      `Reply STOP to opt out.`
    );
  },

  /**
   * Event updated notification
   */
  EVENT_UPDATED: (data) => {
    const title = data.title || 'Church Event';
    const date = formatSmsDate(data.date);
    const changes = data.changes || 'Schedule / Venue updated';
    const link = data.link || 'kcmchurch.vercel.app/#events';

    return sanitizeMessageContent(
      `KCM Ministries: Event Update\n` +
      `📢 ${title}\n` +
      `🗓 Date: ${date}\n` +
      `ℹ️ ${changes}\n` +
      `Details: ${link}`
    );
  },

  /**
   * Event cancelled notification
   */
  EVENT_CANCELLED: (data) => {
    const title = data.title || 'Church Event';
    const date = formatSmsDate(data.date);

    return sanitizeMessageContent(
      `KCM Ministries: Notice\n` +
      `Please note that "${title}" scheduled for ${date} has been cancelled. God bless you.`
    );
  },

  /**
   * Member registration welcome message
   */
  MEMBER_WELCOME: (data) => {
    const name = data.name ? ` ${data.name}` : '';
    return sanitizeMessageContent(
      `Welcome to Kingdom of Christ Ministries${name}! Your membership registration is confirmed. We look forward to fellowship with you. God bless you!`
    );
  },

  /**
   * Verified donation confirmation message
   */
  DONATION_CONFIRMATION: (data) => {
    const amount = data.amount || 0;
    const ref = data.receiptNumber || data.reference || 'KCM-OFFERING';
    const receiptUrl = data.receiptUrl || 'kcmchurch.vercel.app/give/receipts';

    return sanitizeMessageContent(
      `KCM Ministries: Praise the Lord! Your offering of ₹${amount} was received successfully. (Ref: ${ref}). Receipt: ${receiptUrl}. God bless your generous heart!`
    );
  },

  /**
   * Prayer request received confirmation
   */
  PRAYER_ACKNOWLEDGED: (data) => {
    const name = data.name ? ` ${data.name}` : '';
    return sanitizeMessageContent(
      `Kingdom of Christ Ministries: Dear${name}, your prayer request has been received. Our pastoral team is standing in prayer with you. "For with God nothing shall be impossible." - Luke 1:37`
    );
  },

  /**
   * Admin custom broadcast message
   */
  ADMIN_BROADCAST: (data) => {
    if (data.rawMessage) {
      return sanitizeMessageContent(interpolate(data.rawMessage, data));
    }
    const subject = data.subject || 'Important Announcement';
    const body = data.body || '';
    return sanitizeMessageContent(
      `KCM Ministries Alert:\n` +
      `${subject}\n` +
      `${body}\n` +
      `kcmchurch.vercel.app`
    );
  },
};

/**
 * Builds an SMS message from a template type and data payload.
 *
 * @param {keyof typeof SMS_TEMPLATES | string} templateType
 * @param {Record<string, any>} data
 * @returns {string}
 */
function renderSmsTemplate(templateType, data = {}) {
  const templateFn = SMS_TEMPLATES[templateType];
  if (typeof templateFn === 'function') {
    return templateFn(data);
  }
  if (data.message || data.rawMessage) {
    return sanitizeMessageContent(data.message || data.rawMessage);
  }
  return `KCM Ministries: Notification from Church Portal.`;
}

module.exports = {
  SMS_TEMPLATES,
  renderSmsTemplate,
  formatSmsDate,
  interpolate,
};
