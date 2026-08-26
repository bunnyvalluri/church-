/**
 * backend/src/modules/notifications/sms/mock.provider.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock SMS Provider for local development and automated test suites.
 * Simulates carrier delivery, failures, and statuses without external network calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { BaseSMSProvider } = require('./sms.provider');
const { SMS_STATUS, SMS_ERROR_CODE, SMS_PROVIDER } = require('./sms.constants');
const { maskPhoneNumber } = require('./sms.validation');

class MockSMSProvider extends BaseSMSProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.simulatedDelayMs=50]
   * @param {boolean} [options.simulateFailure=false]
   * @param {string} [options.failureReason='Simulated mock provider failure']
   */
  constructor(options = {}) {
    super(SMS_PROVIDER.MOCK);
    this.simulatedDelayMs = options.simulatedDelayMs !== undefined ? options.simulatedDelayMs : 50;
    this.simulateFailure = !!options.simulateFailure;
    this.failureReason = options.failureReason || 'Simulated mock provider failure';
    /** @type {Map<string, { payload: import('./sms.types').SendSMSPayload, status: string, createdAt: Date }>} */
    this.sentMessages = new Map();
  }

  /**
   * Sends a mock SMS and records it in memory.
   *
   * @param {import('./sms.types').SendSMSPayload} payload
   * @returns {Promise<import('./sms.types').SendSMSResult>}
   */
  async sendSMS(payload) {
    if (this.simulatedDelayMs > 0) {
      await new Promise(r => setTimeout(r, this.simulatedDelayMs));
    }

    const to = payload.to;
    const providerMessageId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (this.simulateFailure) {
      return {
        success: false,
        status: SMS_STATUS.FAILED,
        error: this.failureReason,
        errorCode: SMS_ERROR_CODE.TRANSIENT_ERROR,
        rawResponse: { mock: true, failure: true },
      };
    }

    this.sentMessages.set(providerMessageId, {
      payload,
      status: SMS_STATUS.SENT,
      createdAt: new Date(),
    });

    console.log(`[MockSMSProvider] 🧪 [MOCK SMS SENT] -> To: ${maskPhoneNumber(to)} (ID: ${providerMessageId})`);
    console.log(`[MockSMSProvider] 📝 Content: "${payload.message.substring(0, 80)}..."`);

    return {
      success: true,
      providerMessageId,
      status: SMS_STATUS.SENT,
      rawResponse: { mock: true, to, timestamp: new Date().toISOString() },
    };
  }

  /**
   * Returns current mock message status.
   *
   * @param {string} providerMessageId
   * @returns {Promise<import('./sms.types').MessageStatusResult>}
   */
  async getMessageStatus(providerMessageId) {
    const record = this.sentMessages.get(providerMessageId);
    if (!record) {
      return {
        providerMessageId,
        status: SMS_STATUS.DELIVERED,
        deliveredAt: new Date(),
        raw: { mock: true, synthetic: true },
      };
    }

    return {
      providerMessageId,
      status: /** @type {any} */ (record.status),
      deliveredAt: record.status === SMS_STATUS.DELIVERED ? new Date() : undefined,
      raw: { mock: true, record },
    };
  }

  /**
   * Mock webhook verification always passes in test/mock mode.
   *
   * @param {any} req
   * @returns {boolean}
   */
  verifyWebhook(req) {
    return true;
  }

  /**
   * Parses mock webhook payload.
   *
   * @param {any} req
   * @returns {import('./sms.types').SMSWebhookEvent}
   */
  parseWebhookPayload(req) {
    const body = req.body || {};
    return {
      eventType: body.type || 'message.delivered',
      providerMessageId: body.providerMessageId || body.id || 'mock_msg_id',
      status: body.status ? /** @type {any} */ (body.status.toUpperCase()) : SMS_STATUS.DELIVERED,
      timestamp: new Date(),
      failureReason: body.failureReason,
      rawData: body,
    };
  }
}

module.exports = { MockSMSProvider };
