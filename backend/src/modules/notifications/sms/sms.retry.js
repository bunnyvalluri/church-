/**
 * backend/src/modules/notifications/sms/sms.retry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Exponential backoff with jitter calculator and error classification
 * for resilient SMS retries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { SMS_ERROR_CODE, SMS_DEFAULTS } = require('./sms.constants');

/**
 * Calculates exponential backoff with full jitter to avoid thundering herd.
 *
 * @param {number} attempt - 1-based attempt number
 * @param {number} [baseDelay=5000] - Base delay in milliseconds
 * @param {number} [maxDelay=300000] - Cap maximum delay (default 5 min)
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(
  attempt,
  baseDelay = SMS_DEFAULTS.BASE_RETRY_DELAY_MS,
  maxDelay = SMS_DEFAULTS.MAX_RETRY_DELAY_MS
) {
  const exponent = Math.max(0, attempt - 1);
  const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, exponent));
  // Add full jitter between 0 and 1500ms
  const jitter = Math.floor(Math.random() * 1500);
  return Math.min(maxDelay, exponential + jitter);
}

/**
 * Determines whether a given SMS error code is transient (retryable).
 *
 * @param {string} errorCode
 * @returns {boolean}
 */
function isRetryableError(errorCode) {
  const retryableCodes = [
    SMS_ERROR_CODE.TRANSIENT_ERROR,
    SMS_ERROR_CODE.RATE_LIMIT_ERROR,
    SMS_ERROR_CODE.GATEWAY_OFFLINE,
    SMS_ERROR_CODE.SMS_PROVIDER_UNAVAILABLE,
    SMS_ERROR_CODE.SMS_TIMEOUT,
    SMS_ERROR_CODE.SMS_QUEUE_ERROR,
  ];
  return retryableCodes.includes(errorCode);
}

/**
 * Classifies an arbitrary HTTP status or error object into an SMS_ERROR_CODE.
 *
 * @param {any} error
 * @param {number} [httpStatus]
 * @returns {string}
 */
function classifyProviderError(error, httpStatus) {
  if (httpStatus === 429) {
    return SMS_ERROR_CODE.RATE_LIMIT_ERROR;
  }
  if (httpStatus === 401 || httpStatus === 403) {
    return SMS_ERROR_CODE.AUTH_ERROR;
  }
  if (httpStatus === 400 || httpStatus === 422) {
    return SMS_ERROR_CODE.INVALID_NUMBER;
  }
  if (httpStatus >= 500 && httpStatus <= 599) {
    return SMS_ERROR_CODE.SMS_PROVIDER_UNAVAILABLE;
  }

  const msg = (error?.message || error?.toString() || '').toLowerCase();

  if (msg.includes('timeout') || msg.includes('etimedout') || msg.includes('esockettimedout')) {
    return SMS_ERROR_CODE.SMS_TIMEOUT;
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return SMS_ERROR_CODE.RATE_LIMIT_ERROR;
  }
  if (msg.includes('invalid number') || msg.includes('phone') || msg.includes('e.164') || msg.includes('unreachable')) {
    return SMS_ERROR_CODE.INVALID_NUMBER;
  }
  if (msg.includes('offline') || msg.includes('device disconnected') || msg.includes('gateway')) {
    return SMS_ERROR_CODE.GATEWAY_OFFLINE;
  }
  if (msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('api key')) {
    return SMS_ERROR_CODE.AUTH_ERROR;
  }
  if (msg.includes('duplicate') || msg.includes('idempotent')) {
    return SMS_ERROR_CODE.SMS_DUPLICATE;
  }

  return SMS_ERROR_CODE.TRANSIENT_ERROR;
}

module.exports = {
  calculateBackoffDelay,
  isRetryableError,
  classifyProviderError,
};
