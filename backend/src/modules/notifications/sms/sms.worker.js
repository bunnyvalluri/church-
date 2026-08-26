/**
 * backend/src/modules/notifications/sms/sms.worker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SMS Delivery Background Worker.
 * Processes outbound SMS jobs, enforces rate limiting, calls the active SMS
 * provider, orchestrates exponential backoff retries, and broadcasts
 * live Socket.io events to the Admin portal.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { SMS_STATUS, SMS_ERROR_CODE } = require('./sms.constants');
const { calculateBackoffDelay, isRetryableError } = require('./sms.retry');
const { maskPhoneNumber } = require('./sms.validation');

class SMSWorker {
  /**
   * @param {Object} dependencies
   * @param {import('./sms.repository').SMSRepository} dependencies.repository
   * @param {import('./sms.provider').BaseSMSProvider} dependencies.provider
   * @param {import('./sms.queue').SMSQueue} dependencies.queue
   * @param {any} [dependencies.io] - Socket.io server instance
   */
  constructor({ repository, provider, queue, io }) {
    this.repository = repository;
    this.provider = provider;
    this.queue = queue;
    this.io = io || null;
    this.isRunning = false;
    this.pollInterval = null;
    this.isProcessingBatch = false;
  }

  /**
   * Attach or update the Socket.io server instance.
   * @param {any} io
   */
  setSocketIo(io) {
    this.io = io;
  }

  /**
   * Attach or update the active SMS provider instance.
   * @param {import('./sms.provider').BaseSMSProvider} provider
   */
  setProvider(provider) {
    this.provider = provider;
  }

  /**
   * Starts the polling worker loop.
   * @param {number} [intervalMs=5000]
   */
  start(intervalMs = 5000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[SMSWorker] 🚀 Outbox background SMS worker started (polling every ${intervalMs}ms)`);

    this.pollInterval = setInterval(() => {
      this.processPendingBatch().catch(err => {
        console.error('[SMSWorker] Error in poll cycle:', err.message);
      });
    }, intervalMs);

    // Initial cycle
    setTimeout(() => this.processPendingBatch(), 1000);
  }

  /**
   * Stops the worker loop.
   */
  stop() {
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('[SMSWorker] SMS background worker stopped.');
  }

  /**
   * Broadcasts real-time Socket.io update to administrative dashboard.
   *
   * @param {string} eventName
   * @param {any} payload
   */
  _emitSocket(eventName, payload) {
    if (!this.io) return;
    try {
      this.io.emit(eventName, payload);
      this.io.emit('sms.updated', payload);
    } catch (err) {
      console.warn('[SMSWorker] Socket.io emit warning:', err.message);
    }
  }

  /**
   * Processes a single SMS message record through the provider pipeline.
   *
   * @param {string} messageId - CUID of the SmsMessage
   * @returns {Promise<{ success: boolean, status: string, error?: string }>}
   */
  async processMessage(messageId) {
    const msg = await this.repository.findById(messageId);
    if (!msg) {
      return { success: false, status: SMS_STATUS.FAILED, error: 'SMS message record not found' };
    }

    // Guard against processing non-pending states
    if (msg.status !== SMS_STATUS.QUEUED && msg.status !== SMS_STATUS.RETRYING) {
      return { success: true, status: msg.status };
    }

    // Check message expiration
    if (msg.expiresAt && new Date() > new Date(msg.expiresAt)) {
      const updated = await this.repository.updateMessage(msg.id, {
        status: SMS_STATUS.EXPIRED,
        failedAt: new Date(),
        failureReason: 'Message expired before delivery window',
        errorCode: SMS_ERROR_CODE.EXPIRED_MESSAGE,
      });
      this._emitSocket('sms.expired', updated);
      return { success: false, status: SMS_STATUS.EXPIRED, error: 'Expired' };
    }

    // Rate Limiter Check — rate limit outbound sends to protect SIM card
    if (!this.queue.rateLimiter.canSend()) {
      const waitMs = this.queue.rateLimiter.getWaitTimeMs();
      console.log(`[SMSWorker] Rate limit active. Pausing delivery for ${waitMs}ms`);
      await new Promise(r => setTimeout(r, waitMs));
    }

    // Mark PROCESSING
    await this.repository.updateMessage(msg.id, {
      status: SMS_STATUS.PROCESSING,
      attempts: msg.attempts + 1,
    });
    this._emitSocket('sms.processing', { id: msg.id, status: SMS_STATUS.PROCESSING, attempts: msg.attempts + 1 });

    this.queue.rateLimiter.recordSend();

    // Call active provider
    try {
      const sendResult = await this.provider.sendSMS({
        to: msg.normalizedPhoneNumber || msg.phoneNumber,
        message: msg.message,
        idempotencyKey: msg.idempotencyKey || undefined,
        memberId: msg.memberId || undefined,
        notificationId: msg.notificationId || undefined,
      });

      if (sendResult.success) {
        const updateData = {
          status: sendResult.status || SMS_STATUS.SENT,
          providerMessageId: sendResult.providerMessageId || msg.providerMessageId,
          sentAt: new Date(),
          failureReason: null,
          errorCode: null,
        };

        if (sendResult.status === SMS_STATUS.DELIVERED) {
          updateData.deliveredAt = new Date();
        }

        const updated = await this.repository.updateMessage(msg.id, updateData);
        this._emitSocket('sms.sent', updated);

        console.log(`[SMSWorker] ✅ Successfully dispatched SMS to ${maskPhoneNumber(msg.phoneNumber)} (ID: ${msg.id})`);
        return { success: true, status: updated.status };
      }

      // Handle Provider Failure
      return await this._handleFailure(msg, sendResult.error || 'Provider rejected SMS', sendResult.errorCode);
    } catch (err) {
      return await this._handleFailure(msg, err.message, SMS_ERROR_CODE.TRANSIENT_ERROR);
    }
  }

  /**
   * Handles delivery failure and calculates exponential retry or dead-letter.
   *
   * @param {any} msg
   * @param {string} failureReason
   * @param {string} [errorCode]
   */
  async _handleFailure(msg, failureReason, errorCode = SMS_ERROR_CODE.TRANSIENT_ERROR) {
    const currentAttempts = (msg.attempts || 0) + 1;
    const maxAttempts = msg.maxAttempts || 3;
    const retryable = isRetryableError(errorCode) && currentAttempts < maxAttempts;

    if (retryable) {
      const delayMs = calculateBackoffDelay(currentAttempts);
      const nextScheduledAt = new Date(Date.now() + delayMs);

      const updated = await this.repository.updateMessage(msg.id, {
        status: SMS_STATUS.RETRYING,
        attempts: currentAttempts,
        scheduledAt: nextScheduledAt,
        failureReason: `${failureReason} (Attempt ${currentAttempts}/${maxAttempts}, next retry in ${Math.round(delayMs / 1000)}s)`,
        errorCode: /** @type {any} */ (errorCode),
      });

      this._emitSocket('sms.retrying', updated);
      console.warn(`[SMSWorker] 🔄 Retry scheduled for SMS ${msg.id} in ${Math.round(delayMs / 1000)}s`);

      return { success: false, status: SMS_STATUS.RETRYING, error: failureReason };
    }

    // Permanent Failure / Max Attempts Exhausted
    const updated = await this.repository.updateMessage(msg.id, {
      status: SMS_STATUS.FAILED,
      attempts: currentAttempts,
      failedAt: new Date(),
      failureReason: `${failureReason} (Max attempts of ${maxAttempts} reached or non-retryable error)`,
      errorCode: /** @type {any} */ (errorCode),
    });

    this._emitSocket('sms.failed', updated);
    console.error(`[SMSWorker] ❌ Permanently failed SMS ${msg.id} to ${maskPhoneNumber(msg.phoneNumber)}: ${failureReason}`);

    return { success: false, status: SMS_STATUS.FAILED, error: failureReason };
  }

  /**
   * Processes a batch of pending/retryable messages from PostgreSQL.
   */
  async processPendingBatch() {
    if (this.isProcessingBatch) return;
    this.isProcessingBatch = true;

    try {
      if (!this.repository || typeof this.repository.findPendingMessages !== 'function') return;
      const pending = await this.repository.findPendingMessages(10);
      if (Array.isArray(pending) && pending.length > 0) {
        console.log(`[SMSWorker] Found ${pending.length} pending SMS messages in outbox to process`);
        for (const msg of pending) {
          await this.processMessage(msg.id);
          // 100ms throttle between loop items
          await new Promise(r => setTimeout(r, 100));
        }
      }
    } catch (err) {
      // Safe catch for startup/unmigrated state
    } finally {
      this.isProcessingBatch = false;
    }
  }
}

module.exports = { SMSWorker };
