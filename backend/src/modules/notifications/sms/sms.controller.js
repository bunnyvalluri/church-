/**
 * backend/src/modules/notifications/sms/sms.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP Controllers for SMS administrative endpoints, test console,
 * stats metrics, and webhook processing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { getSMSService } = require('./sms.service');
const { maskPhoneNumber } = require('./sms.validation');
const { SMS_AUDIT_ACTION } = require('./sms.constants');

/**
 * Controller class for SMS API operations.
 */
class SMSController {
  constructor() {
    this.service = getSMSService();
  }

  /**
   * Helper to ensure service has reference to current Socket.io if available.
   * @param {any} req
   */
  _bindIo(req) {
    if (req.app?.get('io')) {
      this.service.setSocketIo(req.app.get('io'));
    }
  }

  /**
   * Send a test SMS (Admin & Super Admin only).
   * POST /api/admin/sms/test
   */
  sendTestSms = async (req, res) => {
    try {
      this._bindIo(req);
      const { phoneNumber, message, template } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, error: 'phoneNumber and message are required' });
      }

      const user = req.user || { id: 'admin', role: 'ADMIN' };
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const idempotencyKey = `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const result = await this.service.sendSingleSMS({
        to: phoneNumber,
        message,
        idempotencyKey,
        metadata: { isTest: true, initiatedBy: user.id },
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      // Record audit
      await this.service.repository.recordAuditLog({
        userId: user.id,
        role: user.role,
        action: SMS_AUDIT_ACTION.SMS_TEST_SENT,
        recipientCount: 1,
        template: template || 'TEST',
        provider: this.service.provider.name,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
        status: 'SUCCESS',
        metadata: { to: maskPhoneNumber(phoneNumber), messageId: result.messageId },
      });

      return res.json({
        success: true,
        message: 'Test SMS queued successfully',
        messageId: result.messageId,
        provider: this.service.provider.name,
      });
    } catch (err) {
      console.error('[SMSController/sendTestSms] Error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Send Single SMS.
   * POST /api/admin/sms/send
   */
  sendSms = async (req, res) => {
    try {
      this._bindIo(req);
      const { to, message, memberId, notificationId, category } = req.body;

      if (!to || !message) {
        return res.status(400).json({ success: false, error: 'to and message are required' });
      }

      const result = await this.service.sendSingleSMS({
        to,
        message,
        memberId,
        notificationId,
        category,
        idempotencyKey: req.body.idempotencyKey || `send-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({ success: true, messageId: result.messageId, isDuplicate: result.isDuplicate });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Send Bulk Broadcast SMS.
   * POST /api/admin/sms/broadcast
   */
  broadcastSms = async (req, res) => {
    try {
      this._bindIo(req);
      const { recipients, message, template } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ success: false, error: 'recipients must be a non-empty array' });
      }
      if (!message) {
        return res.status(400).json({ success: false, error: 'message content is required' });
      }

      const user = req.user || { id: 'admin', role: 'ADMIN' };
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const result = await this.service.sendAdminBroadcast({
        recipients,
        message,
        template,
        adminUserId: user.id,
        adminRole: user.role,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
      });

      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * List SMS messages with pagination & filtering.
   * GET /api/admin/sms
   */
  listMessages = async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const status = req.query.status ? String(req.query.status) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

      const data = await this.service.listMessages({ page, limit, status, search, startDate, endDate });
      return res.json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Aggregate stats for admin cards and charts.
   * GET /api/admin/sms/stats
   */
  getStats = async (req, res) => {
    try {
      const stats = await this.service.getStats();
      return res.json({ success: true, stats });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Get single message details by ID.
   * GET /api/admin/sms/:id
   */
  getMessageById = async (req, res) => {
    try {
      const msg = await this.service.getMessageById(req.params.id);
      if (!msg) return res.status(404).json({ success: false, error: 'SMS not found' });
      return res.json({ success: true, message: msg });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Retry a failed SMS message.
   * POST /api/admin/sms/:id/retry
   */
  retryMessage = async (req, res) => {
    try {
      this._bindIo(req);
      const user = req.user || { id: 'admin', role: 'ADMIN' };
      const updated = await this.service.retryMessage(req.params.id, {
        userId: user.id,
        role: user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.json({ success: true, message: updated });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  };

  /**
   * Cancel a queued SMS message.
   * POST /api/admin/sms/:id/cancel
   */
  cancelMessage = async (req, res) => {
    try {
      this._bindIo(req);
      const user = req.user || { id: 'admin', role: 'ADMIN' };
      const updated = await this.service.cancelMessage(req.params.id, {
        userId: user.id,
        role: user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.json({ success: true, message: updated });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  };

  /**
   * Get SMS provider and gateway settings.
   * GET /api/admin/sms/settings
   */
  getSettings = async (req, res) => {
    try {
      const provider = this.service.provider.name;
      const isConfigured = !!(process.env.HTTPSMS_API_KEY && process.env.HTTPSMS_API_KEY.length > 5);
      const fromNumber = process.env.HTTPSMS_FROM_NUMBER ? maskPhoneNumber(process.env.HTTPSMS_FROM_NUMBER) : 'Not configured';

      return res.json({
        success: true,
        settings: {
          provider,
          isConfigured,
          fromNumber,
          defaultCountry: 'IN',
          maxRetries: 3,
          rateLimitPerMinute: this.service.queue.rateLimiter.maxPerMinute,
          queueMode: this.service.queue.bullmqQueue ? 'BullMQ (Redis)' : 'PostgreSQL Outbox Worker',
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Webhook handler for incoming provider delivery updates.
   * POST /api/webhooks/httpsms
   */
  handleWebhook = async (req, res) => {
    try {
      this._bindIo(req);
      const result = await this.service.handleWebhook(req);
      if (!result.success) {
        return res.status(401).json(result);
      }
      return res.json(result);
    } catch (err) {
      console.error('[SMSController/handleWebhook] Error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  };
}

module.exports = {
  SMSController,
  smsController: new SMSController(),
};
