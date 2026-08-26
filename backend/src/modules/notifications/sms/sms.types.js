/**
 * backend/src/modules/notifications/sms/sms.types.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Type definitions and JSDoc contracts for the SMS delivery engine.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/**
 * @typedef {'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'EXPIRED' | 'CANCELLED'} SmsStatus
 *
 * @typedef {'TRANSIENT_ERROR' | 'PERMANENT_ERROR' | 'RATE_LIMIT_ERROR' | 'AUTH_ERROR' | 'INVALID_NUMBER' | 'EXPIRED_MESSAGE' | 'GATEWAY_OFFLINE' | 'SMS_PROVIDER_UNAVAILABLE' | 'SMS_TIMEOUT' | 'SMS_DUPLICATE' | 'SMS_QUEUE_ERROR' | 'UNKNOWN'} SmsErrorCode
 *
 * @typedef {Object} SendSMSPayload
 * @property {string} to - Destination phone number (raw or normalized)
 * @property {string} message - Text content of the SMS
 * @property {string} [from] - Optional originating SIM / sender phone number
 * @property {string} [idempotencyKey] - Unique idempotency identifier
 * @property {string} [memberId] - Associated member/user ID
 * @property {string} [notificationId] - Associated business notification ID
 * @property {Date} [scheduledAt] - Future scheduled send timestamp
 * @property {Date} [expiresAt] - Message expiration timestamp
 * @property {Record<string, any>} [metadata] - Additional business context
 *
 * @typedef {Object} SendSMSResult
 * @property {boolean} success - Whether provider accepted the message
 * @property {string} [providerMessageId] - Provider message tracking ID
 * @property {SmsStatus} status - Initial delivery status
 * @property {string} [error] - Error message if failed
 * @property {SmsErrorCode} [errorCode] - Categorized error code
 * @property {Record<string, any>} [rawResponse] - Raw response from provider
 *
 * @typedef {Object} MessageStatusResult
 * @property {string} providerMessageId - Provider message ID
 * @property {SmsStatus} status - Current message status
 * @property {Date} [deliveredAt] - Timestamp when delivered
 * @property {Date} [failedAt] - Timestamp when failed
 * @property {string} [failureReason] - Failure reason string
 * @property {Record<string, any>} [raw] - Raw provider payload
 *
 * @typedef {Object} SMSWebhookEvent
 * @property {string} eventType - e.g., 'message.sent', 'message.delivered', 'message.failed'
 * @property {string} providerMessageId - Provider unique message identifier
 * @property {SmsStatus} status - Updated status
 * @property {Date} [timestamp] - Webhook event timestamp
 * @property {string} [failureReason] - Reason for failure if applicable
 * @property {Record<string, any>} [rawData] - Full webhook payload
 */

module.exports = {};
