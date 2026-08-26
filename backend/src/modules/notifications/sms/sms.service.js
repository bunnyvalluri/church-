/**
 * backend/src/modules/notifications/sms/sms.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central SMS Delivery Business Service for KCM Ministries.
 * Orchestrates member preference checks, phone normalization, idempotency,
 * transactional persistence, queue dispatching, and audit logging.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { SMSRepository } = require('./sms.repository');
const { SMSQueue } = require('./sms.queue');
const { SMSWorker } = require('./sms.worker');
const { HttpSMSProvider } = require('./httpsms.provider');
const { MockSMSProvider } = require('./mock.provider');
const { SMS_STATUS, SMS_PROVIDER, SMS_AUDIT_ACTION } = require('./sms.constants');
const { normalizePhoneNumber, maskPhoneNumber } = require('./sms.validation');
const { renderSmsTemplate } = require('./sms.templates');

class SMSService {
  /**
   * @param {Object} [options]
   * @param {any} [options.prisma]
   * @param {any} [options.io]
   * @param {string} [options.providerType]
   */
  constructor(options = {}) {
    this.repository = new SMSRepository(options.prisma);
    this.queue = new SMSQueue();
    
    // Choose active provider based on environment
    const providerChoice = options.providerType || process.env.SMS_PROVIDER || (process.env.NODE_ENV === 'production' && process.env.HTTPSMS_API_KEY ? SMS_PROVIDER.HTTPSMS : SMS_PROVIDER.MOCK);
    
    if (providerChoice === SMS_PROVIDER.HTTPSMS && process.env.HTTPSMS_API_KEY) {
      this.provider = new HttpSMSProvider({
        apiKey: process.env.HTTPSMS_API_KEY,
        baseUrl: process.env.HTTPSMS_BASE_URL,
        fromNumber: process.env.HTTPSMS_FROM_NUMBER,
        webhookSecret: process.env.HTTPSMS_WEBHOOK_SECRET,
      });
      console.log('[SMSService] 🌐 Initialized with Production HttpSMSProvider');
    } else {
      this.provider = new MockSMSProvider();
      console.log('[SMSService] 🧪 Initialized with MockSMSProvider (Development / Testing Mode)');
    }

    this.worker = new SMSWorker({
      repository: this.repository,
      provider: this.provider,
      queue: this.queue,
      io: options.io,
    });

    // Auto-start worker
    if (process.env.SMS_QUEUE_ENABLED !== 'false') {
      this.worker.start(4000);
    }
  }

  /**
   * Set or update the companion Socket.io instance.
   * @param {any} io
   */
  setSocketIo(io) {
    this.worker.setSocketIo(io);
  }

  /**
   * Sends a single SMS message with phone normalization and idempotency protection.
   *
   * @param {Object} params
   * @param {string} params.to - Destination phone number
   * @param {string} params.message - Message body content
   * @param {string} [params.memberId] - Associated member user ID
   * @param {string} [params.notificationId] - Associated business notification ID
   * @param {string} [params.idempotencyKey] - Unique operation key
   * @param {string} [params.category] - Preference category (events, donations, etc.)
   * @param {Date} [params.scheduledAt] - Future scheduled send timestamp
   * @param {Date} [params.expiresAt] - Message expiration timestamp
   * @param {Record<string, any>} [params.metadata]
   * @returns {Promise<{ success: boolean, messageId?: string, isDuplicate?: boolean, error?: string }>}
   */
  async sendSingleSMS({
    to,
    message,
    memberId,
    notificationId,
    idempotencyKey,
    category,
    scheduledAt,
    expiresAt,
    metadata = {},
  }) {
    // 1. Phone number normalization
    const { valid, normalized, error: phoneError } = normalizePhoneNumber(to);
    if (!valid || !normalized) {
      console.warn(`[SMSService] Invalid phone number skipped: "${to}" (${phoneError})`);
      return { success: false, error: phoneError || 'Invalid phone number' };
    }

    // 2. Member notification preference check
    if (memberId) {
      const pref = await this.repository.getMemberPreference(memberId);
      if (pref) {
        if (!pref.smsEnabled) {
          console.log(`[SMSService] Member ${memberId} has globally opted out of SMS.`);
          return { success: false, error: 'Member opted out of SMS notifications' };
        }
        if (category && pref[category] === false) {
          console.log(`[SMSService] Member ${memberId} opted out of ${category} SMS.`);
          return { success: false, error: `Member opted out of ${category} notifications` };
        }
      }
    }

    // 3. Database persistence with idempotency guarantee
    const { message: smsRecord, isDuplicate } = await this.repository.createMessage({
      notificationId,
      memberId,
      phoneNumber: to,
      normalizedPhoneNumber: normalized,
      message,
      provider: this.provider.name,
      idempotencyKey: idempotencyKey || null,
      status: SMS_STATUS.QUEUED,
      scheduledAt: scheduledAt || null,
      expiresAt: expiresAt || null,
      metadata,
    });

    if (isDuplicate) {
      console.log(`[SMSService] Idempotent hit: SMS record ${smsRecord.id} already exists for key "${idempotencyKey}".`);
      return { success: true, messageId: smsRecord.id, isDuplicate: true };
    }

    // 4. Enqueue for background worker
    await this.queue.enqueue(smsRecord.id);

    return { success: true, messageId: smsRecord.id, isDuplicate: false };
  }

  /**
   * Dispatches event announcement SMS to a list of members.
   *
   * @param {Object} event
   * @param {Array<{ id?: string, mobile?: string, phone?: string, full_name?: string, name?: string }>} members
   * @param {Object} [options]
   * @param {boolean} [options.isUpdate=false]
   * @param {string} [options.changes]
   * @returns {Promise<{ total: number, enqueued: number, skipped: number }>}
   */
  async sendEventSMS(event, members = [], { isUpdate = false, changes = '' } = {}) {
    if (!members || members.length === 0) {
      return { total: 0, enqueued: 0, skipped: 0 };
    }

    const templateType = isUpdate ? 'EVENT_UPDATED' : 'EVENT_CREATED';
    const messageContent = renderSmsTemplate(templateType, {
      title: event.title,
      date: event.date || event.event_date,
      time: event.time || event.event_time,
      location: event.location,
      branch: event.branch?.name || event.branch,
      changes,
      link: `kcmchurch.vercel.app/#events`,
    });

    let enqueued = 0;
    let skipped = 0;

    for (const member of members) {
      const phone = member.mobile || member.phone;
      if (!phone) {
        skipped++;
        continue;
      }

      const memberId = member.id || member.sheetRowIndex ? `sheet_${member.sheetRowIndex}` : null;
      const idempotencyKey = `event-${event.id || 'evt'}-${memberId || phone}-${isUpdate ? 'update' : 'create'}`;

      const res = await this.sendSingleSMS({
        to: phone,
        message: messageContent,
        memberId: member.id || undefined,
        notificationId: event.id || undefined,
        idempotencyKey,
        category: 'events',
        metadata: { eventId: event.id, eventTitle: event.title, isUpdate },
      });

      if (res.success) {
        enqueued++;
      } else {
        skipped++;
      }
    }

    console.log(`[SMSService] Event SMS batch complete for "${event.title}": ${enqueued} enqueued, ${skipped} skipped.`);
    return { total: members.length, enqueued, skipped };
  }

  /**
   * Dispatches a welcome SMS upon successful member registration.
   *
   * @param {Object} member - { id, name, phone, email }
   */
  async sendWelcomeSMS(member) {
    if (!member.phone) return { success: false, error: 'No phone number provided' };

    const message = renderSmsTemplate('MEMBER_WELCOME', { name: member.name });
    const idempotencyKey = `member-welcome-${member.id}`;

    return this.sendSingleSMS({
      to: member.phone,
      message,
      memberId: member.id,
      idempotencyKey,
      category: 'events',
      metadata: { type: 'MEMBER_WELCOME', memberId: member.id },
    });
  }

  /**
   * Dispatches a verified donation receipt confirmation SMS.
   *
   * @param {Object} donation - { id, amount, receiptNumber, receiptUrl, phone, donorName }
   */
  async sendDonationSMS(donation) {
    const phone = donation.phone || donation.donorPhone;
    if (!phone) return { success: false, error: 'No phone number for donation receipt' };

    const message = renderSmsTemplate('DONATION_CONFIRMATION', {
      amount: donation.amount,
      receiptNumber: donation.receiptNumber || donation.id,
      receiptUrl: donation.receiptUrl || 'kcmchurch.vercel.app/give',
    });

    const idempotencyKey = `donation-sms-${donation.id}`;

    return this.sendSingleSMS({
      to: phone,
      message,
      memberId: donation.userId || undefined,
      idempotencyKey,
      category: 'donations',
      metadata: { donationId: donation.id, amount: donation.amount },
    });
  }

  /**
   * Dispatches prayer request acknowledgment SMS.
   *
   * @param {Object} prayer - { id, name, phone }
   */
  async sendPrayerSMS(prayer) {
    if (!prayer.phone) return { success: false, error: 'No phone number for prayer request' };

    const message = renderSmsTemplate('PRAYER_ACKNOWLEDGED', { name: prayer.name });
    const idempotencyKey = `prayer-sms-${prayer.id}`;

    return this.sendSingleSMS({
      to: prayer.phone,
      message,
      memberId: prayer.userId || undefined,
      idempotencyKey,
      category: 'prayerMeetings',
      metadata: { prayerId: prayer.id },
    });
  }

  /**
   * Administrative bulk SMS broadcast.
   *
   * @param {Object} params
   * @param {Array<{ phone: string, name?: string, id?: string }>} params.recipients
   * @param {string} params.message
   * @param {string} [params.template]
   * @param {string} [params.adminUserId]
   * @param {string} [params.adminRole]
   * @param {string} [params.ipAddress]
   * @param {string} [params.userAgent]
   */
  async sendAdminBroadcast({
    recipients,
    message,
    template = 'ADMIN_BROADCAST',
    adminUserId,
    adminRole,
    ipAddress,
    userAgent,
  }) {
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients list cannot be empty');
    }

    const broadcastBatchId = `broadcast_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let enqueued = 0;
    let skipped = 0;

    for (const r of recipients) {
      const phone = r.phone || r.mobile;
      if (!phone) {
        skipped++;
        continue;
      }

      const idempotencyKey = `${broadcastBatchId}-${r.id || phone}`;
      const res = await this.sendSingleSMS({
        to: phone,
        message,
        memberId: r.id || undefined,
        idempotencyKey,
        metadata: { broadcastBatchId, adminUserId, template },
      });

      if (res.success) enqueued++;
      else skipped++;
    }

    // Record audit log
    await this.repository.recordAuditLog({
      userId: adminUserId,
      role: adminRole,
      action: SMS_AUDIT_ACTION.SMS_BROADCAST_CREATED,
      recipientCount: enqueued,
      template,
      provider: this.provider.name,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      metadata: { broadcastBatchId, totalRecipients: recipients.length, enqueued, skipped },
    });

    return { broadcastBatchId, total: recipients.length, enqueued, skipped };
  }

  /**
   * Manually retries a failed SMS message.
   * @param {string} id
   * @param {Object} [adminContext]
   */
  async retryMessage(id, adminContext = {}) {
    const msg = await this.repository.findById(id);
    if (!msg) throw new Error('SMS message not found');

    const updated = await this.repository.updateMessage(id, {
      status: SMS_STATUS.QUEUED,
      attempts: 0, // Reset attempts for manual admin retry
      failureReason: null,
      errorCode: null,
      scheduledAt: null,
    });

    await this.queue.enqueue(id);

    await this.repository.recordAuditLog({
      userId: adminContext.userId,
      role: adminContext.role,
      action: SMS_AUDIT_ACTION.SMS_RETRY,
      recipientCount: 1,
      provider: this.provider.name,
      ipAddress: adminContext.ipAddress,
      userAgent: adminContext.userAgent,
      status: 'SUCCESS',
      metadata: { messageId: id, phoneNumber: maskPhoneNumber(msg.phoneNumber) },
    });

    return updated;
  }

  /**
   * Cancels a queued SMS message.
   * @param {string} id
   * @param {Object} [adminContext]
   */
  async cancelMessage(id, adminContext = {}) {
    const msg = await this.repository.findById(id);
    if (!msg) throw new Error('SMS message not found');

    if (msg.status !== SMS_STATUS.QUEUED && msg.status !== SMS_STATUS.RETRYING) {
      throw new Error(`Cannot cancel message with status "${msg.status}"`);
    }

    const updated = await this.repository.updateMessage(id, {
      status: SMS_STATUS.CANCELLED,
      failureReason: 'Cancelled by administrator',
    });

    await this.repository.recordAuditLog({
      userId: adminContext.userId,
      role: adminContext.role,
      action: SMS_AUDIT_ACTION.SMS_CANCELLED,
      recipientCount: 1,
      provider: this.provider.name,
      ipAddress: adminContext.ipAddress,
      userAgent: adminContext.userAgent,
      status: 'SUCCESS',
      metadata: { messageId: id },
    });

    return updated;
  }

  /**
   * Processes incoming httpSMS webhook status notifications.
   *
   * @param {any} req
   * @returns {Promise<{ success: boolean, updated?: any, error?: string }>}
   */
  async handleWebhook(req) {
    const isValid = this.provider.verifyWebhook(req);
    if (!isValid) {
      console.warn('[SMSService] Rejected unauthenticated SMS webhook request.');
      return { success: false, error: 'Invalid webhook signature or credentials' };
    }

    const event = this.provider.parseWebhookPayload(req);
    if (!event.providerMessageId) {
      return { success: true, note: 'Webhook payload ignored (missing provider message ID)' };
    }

    const msg = await this.repository.findByProviderMessageId(event.providerMessageId);
    if (!msg) {
      console.log(`[SMSService] Webhook received for unindexed providerMessageId: "${event.providerMessageId}"`);
      return { success: true, note: 'Message not found in local database' };
    }

    const updateData = {
      status: event.status,
      updatedAt: new Date(),
    };

    if (event.status === SMS_STATUS.DELIVERED) {
      updateData.deliveredAt = event.timestamp || new Date();
    } else if (event.status === SMS_STATUS.FAILED) {
      updateData.failedAt = event.timestamp || new Date();
      if (event.failureReason) updateData.failureReason = event.failureReason;
    }

    const updated = await this.repository.updateMessage(msg.id, updateData);

    // Broadcast live update to Admin Dashboard via Socket.io
    if (this.worker.io) {
      this.worker.io.emit('sms.updated', updated);
      if (event.status === SMS_STATUS.DELIVERED) this.worker.io.emit('sms.delivered', updated);
      if (event.status === SMS_STATUS.FAILED) this.worker.io.emit('sms.failed', updated);
    }

    console.log(`[SMSService] Webhook processed: SMS ${msg.id} updated to status "${event.status}"`);
    return { success: true, updated };
  }

  /**
   * Retrieves aggregate statistics for the admin dashboard.
   */
  async getStats() {
    return this.repository.getStats();
  }

  /**
   * Retrieves paginated messages with filters for the admin dashboard.
   * @param {any} params
   */
  async listMessages(params) {
    return this.repository.listMessages(params);
  }

  /**
   * Retrieves a single message by ID.
   * @param {string} id
   */
  async getMessageById(id) {
    return this.repository.findById(id);
  }
}

// Singleton instance export
let _instance = null;

function getSMSService(options) {
  if (!_instance) {
    _instance = new SMSService(options);
  } else if (options?.io) {
    _instance.setSocketIo(options.io);
  }
  return _instance;
}

module.exports = {
  SMSService,
  getSMSService,
};
