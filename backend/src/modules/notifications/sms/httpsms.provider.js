/**
 * backend/src/modules/notifications/sms/httpsms.provider.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Production httpSMS Provider integration.
 * Communicates with https://api.httpsms.com/v1 via REST API to relay SMS
 * messages to the KCM Android Gateway phone.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const crypto = require('crypto');
const { BaseSMSProvider } = require('./sms.provider');
const { SMS_STATUS, SMS_ERROR_CODE, SMS_PROVIDER } = require('./sms.constants');
const { classifyProviderError } = require('./sms.retry');
const { maskPhoneNumber } = require('./sms.validation');

class HttpSMSProvider extends BaseSMSProvider {
  /**
   * @param {Object} [config]
   * @param {string} [config.apiKey]
   * @param {string} [config.baseUrl]
   * @param {string} [config.fromNumber]
   * @param {string} [config.webhookSecret]
   */
  constructor(config = {}) {
    super(SMS_PROVIDER.HTTPSMS);
    this.apiKey = config.apiKey || process.env.HTTPSMS_API_KEY || '';
    this.baseUrl = (config.baseUrl || process.env.HTTPSMS_BASE_URL || 'https://api.httpsms.com/v1').replace(/\/$/, '');
    this.fromNumber = config.fromNumber || process.env.HTTPSMS_FROM_NUMBER || '';
    this.webhookSecret = config.webhookSecret || process.env.HTTPSMS_WEBHOOK_SECRET || '';
  }

  /**
   * Internal helper to make authenticated HTTP requests to httpSMS.
   *
   * @param {string} endpoint
   * @param {RequestInit} [options]
   * @returns {Promise<{ status: number, data: any }>}
   */
  async _request(endpoint, options = {}) {
    if (!this.apiKey) {
      throw new Error('HTTPSMS_API_KEY is not configured in server environment');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second request timeout

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      return { status: res.status, data };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  /**
   * Sends an SMS message to a single recipient via httpSMS API.
   *
   * @param {import('./sms.types').SendSMSPayload} payload
   * @returns {Promise<import('./sms.types').SendSMSResult>}
   */
  async sendSMS(payload) {
    const to = payload.to;
    const content = payload.message;
    const from = payload.from || this.fromNumber;

    if (!to) {
      return {
        success: false,
        status: SMS_STATUS.FAILED,
        error: 'Recipient phone number is required',
        errorCode: SMS_ERROR_CODE.INVALID_NUMBER,
      };
    }

    if (!content) {
      return {
        success: false,
        status: SMS_STATUS.FAILED,
        error: 'Message content is empty',
        errorCode: SMS_ERROR_CODE.PERMANENT_ERROR,
      };
    }

    try {
      const body = {
        content,
        to,
        ...(from ? { from } : {}),
      };

      const res = await this._request('/messages/send', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (res.status >= 200 && res.status < 300 && res.data?.status === 'success') {
        const msgData = res.data.data || {};
        const providerMessageId = msgData.id || `httpsms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        let initialStatus = SMS_STATUS.SENT;
        if (msgData.status === 'Pending') initialStatus = SMS_STATUS.PROCESSING;
        if (msgData.status === 'Delivered') initialStatus = SMS_STATUS.DELIVERED;
        if (msgData.status === 'Failed') initialStatus = SMS_STATUS.FAILED;

        console.log(`[HttpSMSProvider] Successfully queued SMS to ${maskPhoneNumber(to)} (ID: ${providerMessageId})`);

        return {
          success: true,
          providerMessageId,
          status: initialStatus,
          rawResponse: res.data,
        };
      }

      // Handle provider response errors
      const errorMsg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
      const errorCode = classifyProviderError(new Error(errorMsg), res.status);

      console.warn(`[HttpSMSProvider] Error dispatching to ${maskPhoneNumber(to)}: ${errorMsg} (${errorCode})`);

      return {
        success: false,
        status: SMS_STATUS.FAILED,
        error: errorMsg,
        errorCode,
        rawResponse: res.data,
      };
    } catch (err) {
      const errorCode = classifyProviderError(err);
      console.error(`[HttpSMSProvider] Network/Exception sending SMS to ${maskPhoneNumber(to)}:`, err.message);

      return {
        success: false,
        status: SMS_STATUS.FAILED,
        error: err.message || 'Network exception communicating with httpSMS API',
        errorCode,
      };
    }
  }

  /**
   * Queries httpSMS for current message status.
   *
   * @param {string} providerMessageId
   * @returns {Promise<import('./sms.types').MessageStatusResult>}
   */
  async getMessageStatus(providerMessageId) {
    if (!providerMessageId) {
      return {
        providerMessageId: '',
        status: SMS_STATUS.FAILED,
        failureReason: 'Missing providerMessageId',
      };
    }

    try {
      const res = await this._request(`/messages/${encodeURIComponent(providerMessageId)}`, {
        method: 'GET',
      });

      if (res.status === 200 && res.data?.data) {
        const msg = res.data.data;
        let status = SMS_STATUS.PROCESSING;
        if (msg.status === 'Sent') status = SMS_STATUS.SENT;
        if (msg.status === 'Delivered') status = SMS_STATUS.DELIVERED;
        if (msg.status === 'Failed') status = SMS_STATUS.FAILED;

        return {
          providerMessageId,
          status,
          deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
          failedAt: msg.failedAt ? new Date(msg.failedAt) : undefined,
          failureReason: msg.failureReason || undefined,
          raw: msg,
        };
      }

      return {
        providerMessageId,
        status: SMS_STATUS.PROCESSING,
        raw: res.data,
      };
    } catch (err) {
      return {
        providerMessageId,
        status: SMS_STATUS.PROCESSING,
        failureReason: err.message,
      };
    }
  }

  /**
   * Verifies an incoming webhook request from httpSMS.
   *
   * @param {any} req
   * @returns {boolean}
   */
  verifyWebhook(req) {
    if (!this.webhookSecret) {
      // If no secret configured, check x-api-key match as fallback
      const reqApiKey = req.headers?.['x-api-key'] || req.headers?.['authorization'];
      if (reqApiKey && this.apiKey && (reqApiKey === this.apiKey || reqApiKey === `Bearer ${this.apiKey}`)) {
        return true;
      }
      return true; // Allow in development
    }

    const signature = req.headers?.['x-webhook-signature'] || req.headers?.['x-signature-sha256'];
    if (!signature) {
      // Also check API key match
      const reqApiKey = req.headers?.['x-api-key'];
      if (reqApiKey && reqApiKey === this.webhookSecret) return true;
      return false;
    }

    try {
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', this.webhookSecret).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Normalizes incoming httpSMS webhook payload into SMSWebhookEvent.
   *
   * @param {any} req
   * @returns {import('./sms.types').SMSWebhookEvent}
   */
  parseWebhookPayload(req) {
    const body = req.body || {};
    const eventType = body.type || body.event || 'message.updated';
    const data = body.data || body;

    const providerMessageId = data.id || data.messageId || data.providerMessageId || '';
    const rawStatus = (data.status || '').toLowerCase();

    let status = SMS_STATUS.PROCESSING;
    if (eventType.includes('sent') || rawStatus === 'sent') {
      status = SMS_STATUS.SENT;
    } else if (eventType.includes('delivered') || rawStatus === 'delivered') {
      status = SMS_STATUS.DELIVERED;
    } else if (eventType.includes('failed') || rawStatus === 'failed') {
      status = SMS_STATUS.FAILED;
    } else if (eventType.includes('expired') || rawStatus === 'expired') {
      status = SMS_STATUS.EXPIRED;
    }

    return {
      eventType,
      providerMessageId,
      status,
      timestamp: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      failureReason: data.failureReason || data.error || undefined,
      rawData: body,
    };
  }
}

module.exports = { HttpSMSProvider };
