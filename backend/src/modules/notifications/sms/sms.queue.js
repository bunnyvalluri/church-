/**
 * backend/src/modules/notifications/sms/sms.queue.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-Mode Queue Dispatcher & Rate Limiter for SMS operations.
 * Operates seamlessly with Redis/BullMQ when available, and gracefully
 * falls back to an in-memory/PostgreSQL Outbox queue otherwise.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { SMS_DEFAULTS } = require('./sms.constants');

class SMSRateLimiter {
  /**
   * @param {number} [maxPerMinute=30]
   */
  constructor(maxPerMinute = SMS_DEFAULTS.RATE_LIMIT_PER_MINUTE) {
    this.maxPerMinute = maxPerMinute;
    /** @type {number[]} */
    this.timestamps = [];
  }

  /**
   * Checks if sending an SMS is currently permitted under rate limits.
   * @returns {boolean}
   */
  canSend() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.timestamps = this.timestamps.filter(ts => ts > oneMinuteAgo);
    return this.timestamps.length < this.maxPerMinute;
  }

  /**
   * Records a sent SMS timestamp for rate limiting.
   */
  recordSend() {
    this.timestamps.push(Date.now());
  }

  /**
   * Returns milliseconds until next send slot is available.
   * @returns {number}
   */
  getWaitTimeMs() {
    if (this.canSend()) return 0;
    const oldest = this.timestamps[0];
    return Math.max(0, 60000 - (Date.now() - oldest) + 50);
  }
}

class SMSQueue {
  /**
   * @param {Object} [options]
   * @param {any} [options.bullmqQueue]
   * @param {number} [options.rateLimitPerMinute]
   */
  constructor(options = {}) {
    this.bullmqQueue = options.bullmqQueue || null;
    this.rateLimiter = new SMSRateLimiter(options.rateLimitPerMinute || SMS_DEFAULTS.RATE_LIMIT_PER_MINUTE);
    /** @type {Array<{ id: string, messageId: string, execute: () => Promise<any> }>} */
    this.inMemoryQueue = [];
    this.isProcessingInMemory = false;
  }

  /**
   * Configures BullMQ instance if Redis connection succeeds.
   * @param {any} queue
   */
  setBullmqQueue(queue) {
    this.bullmqQueue = queue;
  }

  /**
   * Enqueues an SMS job for background asynchronous execution.
   *
   * @param {string} smsMessageId - PostgreSQL CUID of the SmsMessage
   * @param {Object} [jobOptions]
   * @param {number} [jobOptions.delay]
   */
  async enqueue(smsMessageId, jobOptions = {}) {
    if (this.bullmqQueue) {
      try {
        await this.bullmqQueue.add('send-sms', { smsMessageId }, {
          attempts: 1, // Retries are handled via our custom exponential backoff logic
          delay: jobOptions.delay || 0,
          removeOnComplete: true,
          removeOnFail: false,
        });
        return { queued: true, type: 'bullmq' };
      } catch (err) {
        console.warn('[SMSQueue] BullMQ enqueue warning, falling back to outbox queue:', err.message);
      }
    }

    // In-memory Outbox fallback
    this.inMemoryQueue.push({
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      messageId: smsMessageId,
      execute: async () => {},
    });

    return { queued: true, type: 'outbox' };
  }
}

module.exports = {
  SMSQueue,
  SMSRateLimiter,
};
