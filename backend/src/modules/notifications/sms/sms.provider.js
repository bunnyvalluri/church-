/**
 * backend/src/modules/notifications/sms/sms.provider.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Abstract Base Class for SMS Providers.
 * Defines the contract that all SMS implementations (httpSMS, Mock, etc.) must follow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

class BaseSMSProvider {
  /**
   * @param {string} providerName
   */
  constructor(providerName) {
    if (new.target === BaseSMSProvider) {
      throw new TypeError('Cannot construct BaseSMSProvider instances directly');
    }
    this.name = providerName;
  }

  /**
   * Sends an SMS message to a single recipient.
   *
   * @param {import('./sms.types').SendSMSPayload} payload
   * @returns {Promise<import('./sms.types').SendSMSResult>}
   */
  async sendSMS(payload) {
    throw new Error(`sendSMS() not implemented in ${this.name}`);
  }

  /**
   * Queries provider for current message status.
   *
   * @param {string} providerMessageId
   * @returns {Promise<import('./sms.types').MessageStatusResult>}
   */
  async getMessageStatus(providerMessageId) {
    throw new Error(`getMessageStatus() not implemented in ${this.name}`);
  }

  /**
   * Attempts to cancel a queued or pending message with the provider.
   *
   * @param {string} providerMessageId
   * @returns {Promise<boolean>}
   */
  async cancelMessage(providerMessageId) {
    return false; // Default: not supported
  }

  /**
   * Verifies an incoming webhook request signature / token.
   *
   * @param {any} req
   * @returns {Promise<boolean> | boolean}
   */
  verifyWebhook(req) {
    throw new Error(`verifyWebhook() not implemented in ${this.name}`);
  }

  /**
   * Parses and normalizes incoming webhook request into a standard SMSWebhookEvent.
   *
   * @param {any} req
   * @returns {Promise<import('./sms.types').SMSWebhookEvent> | import('./sms.types').SMSWebhookEvent}
   */
  parseWebhookPayload(req) {
    throw new Error(`parseWebhookPayload() not implemented in ${this.name}`);
  }
}

module.exports = { BaseSMSProvider };
