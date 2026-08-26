/**
 * backend/src/modules/notifications/sms/sms.validation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Robust phone number normalization, E.164 validation, content segment
 * calculation, privacy masking, and input sanitation for SMS delivery.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { SMS_DEFAULTS } = require('./sms.constants');

// GSM 7-bit standard character set regex
const GSM7_REGEX = /^[A-Za-z0-9@£$¥èéùìòÇ\r\nØø\f_ΔΦΓΛΩΠΨΣΘΞ^{}\\[~\]|€ÆæßÉ !"#%&'()*+,\-./:;<=>?]*$/;

/**
 * Normalizes an arbitrary phone number string into E.164 format.
 * Defaults to India (+91) if a 10-digit national number is supplied.
 *
 * @param {string} rawPhone - Unsanitized phone number input
 * @param {string} [defaultCountryCode='+91'] - Default country calling code
 * @returns {{ valid: boolean, normalized: string | null, error: string | null }}
 */
function normalizePhoneNumber(rawPhone, defaultCountryCode = SMS_DEFAULTS.DEFAULT_COUNTRY_CODE) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: null, error: 'Phone number is required and must be a string' };
  }

  // Strip all non-digit and non-plus characters
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (!cleaned) {
    return { valid: false, normalized: null, error: 'Phone number contains no numeric digits' };
  }

  // Handle leading zeros: e.g. 09876543210 -> 9876543210
  if (cleaned.startsWith('0') && !cleaned.startsWith('00') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Handle double zero international prefix: e.g. 00919876543210 -> +919876543210
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // Standard Indian 10-digit mobile number: 9876543210 -> +919876543210
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    const formatted = `${defaultCountryCode}${cleaned}`;
    return { valid: true, normalized: formatted, error: null };
  }

  // 12-digit Indian number without '+': 919876543210 -> +919876543210
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return { valid: true, normalized: `+${cleaned}`, error: null };
  }

  // Valid E.164 already with '+'
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
    // Extra validation if Indian number with +91
    if (cleaned.startsWith('+91')) {
      const nationalPart = cleaned.substring(3);
      if (!/^[6-9]\d{9}$/.test(nationalPart)) {
        return { valid: false, normalized: null, error: 'Invalid Indian mobile number structure (must start with 6, 7, 8, or 9 and be 10 digits)' };
      }
    }
    return { valid: true, normalized: cleaned, error: null };
  }

  return {
    valid: false,
    normalized: null,
    error: `Invalid phone number format: "${rawPhone}". Please provide a valid 10-digit mobile number or E.164 formatted number.`,
  };
}

/**
 * Calculates SMS character count, encoding type (GSM-7 vs UCS-2 Unicode),
 * and required billable segments.
 *
 * @param {string} text - Message text
 * @returns {{ length: number, encoding: 'GSM-7' | 'UCS-2', segments: number, remainingInSegment: number }}
 */
function calculateSmsSegments(text) {
  if (!text || typeof text !== 'string') {
    return { length: 0, encoding: 'GSM-7', segments: 0, remainingInSegment: SMS_DEFAULTS.MAX_GSM7_SINGLE_LENGTH };
  }

  const isGsm7 = GSM7_REGEX.test(text);
  const length = text.length;

  if (isGsm7) {
    if (length <= SMS_DEFAULTS.MAX_GSM7_SINGLE_LENGTH) {
      return {
        length,
        encoding: 'GSM-7',
        segments: 1,
        remainingInSegment: SMS_DEFAULTS.MAX_GSM7_SINGLE_LENGTH - length,
      };
    }
    const segments = Math.ceil(length / SMS_DEFAULTS.MAX_GSM7_CONCAT_LENGTH);
    const maxChars = segments * SMS_DEFAULTS.MAX_GSM7_CONCAT_LENGTH;
    return {
      length,
      encoding: 'GSM-7',
      segments,
      remainingInSegment: maxChars - length,
    };
  } else {
    // UCS-2 (Unicode / Telugu / Hindi / Emojis)
    if (length <= SMS_DEFAULTS.MAX_UCS2_SINGLE_LENGTH) {
      return {
        length,
        encoding: 'UCS-2',
        segments: 1,
        remainingInSegment: SMS_DEFAULTS.MAX_UCS2_SINGLE_LENGTH - length,
      };
    }
    const segments = Math.ceil(length / SMS_DEFAULTS.MAX_UCS2_CONCAT_LENGTH);
    const maxChars = segments * SMS_DEFAULTS.MAX_UCS2_CONCAT_LENGTH;
    return {
      length,
      encoding: 'UCS-2',
      segments,
      remainingInSegment: maxChars - length,
    };
  }
}

/**
 * Masks a phone number for privacy in logs and UI.
 * e.g., "+919876543210" -> "+91 98****3210"
 *
 * @param {string} phone - Normalized or raw phone number
 * @returns {string}
 */
function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return 'N/A';
  const clean = phone.trim();
  if (clean.length < 8) return '****';

  const prefix = clean.substring(0, clean.length - 6);
  const suffix = clean.substring(clean.length - 4);
  return `${prefix}****${suffix}`;
}

/**
 * Sanitizes message body content (strips null bytes, controls, trims whitespace).
 *
 * @param {string} text - Raw input message text
 * @returns {string}
 */
function sanitizeMessageContent(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable control characters except \n \r \t
    .trim();
}

module.exports = {
  normalizePhoneNumber,
  calculateSmsSegments,
  maskPhoneNumber,
  sanitizeMessageContent,
};
