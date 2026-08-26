/**
 * backend/src/webhooks/httpsms.webhook.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone webhook route export for httpSMS provider callbacks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { smsController } = require('../modules/notifications/sms/sms.controller');

module.exports = {
  handleHttpSmsWebhook: smsController.handleWebhook,
};
