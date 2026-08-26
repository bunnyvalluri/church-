/**
 * backend/tests/sms.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit & Integration Test Suite for KCM httpSMS Delivery Engine.
 * Runs completely offline using MockSMSProvider without making external network calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const assert = require('assert');
const { normalizePhoneNumber, calculateSmsSegments, maskPhoneNumber } = require('../src/modules/notifications/sms/sms.validation');
const { renderSmsTemplate, interpolate } = require('../src/modules/notifications/sms/sms.templates');
const { calculateBackoffDelay, isRetryableError, classifyProviderError } = require('../src/modules/notifications/sms/sms.retry');
const { MockSMSProvider } = require('../src/modules/notifications/sms/mock.provider');
const { SMSRateLimiter } = require('../src/modules/notifications/sms/sms.queue');
const { SMS_ERROR_CODE, SMS_STATUS } = require('../src/modules/notifications/sms/sms.constants');

console.log('─────────────────────────────────────────────────────────────────');
console.log('🧪 Running KCM SMS Delivery Engine Automated Test Suite');
console.log('─────────────────────────────────────────────────────────────────');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runSuite() {
  // ── 1. Phone Normalization Tests ──────────────────────────────────────────
  console.log('\n📦 [1/6] Phone Normalization & E.164 Tests');

  test('Normalizes standard 10-digit Indian mobile number to E.164 (+91)', () => {
    const res = normalizePhoneNumber('9876543210');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.normalized, '+919876543210');
  });

  test('Normalizes number with leading zero: 09876543210 -> +919876543210', () => {
    const res = normalizePhoneNumber('09876543210');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.normalized, '+919876543210');
  });

  test('Preserves already valid E.164 number', () => {
    const res = normalizePhoneNumber('+919876543210');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.normalized, '+919876543210');
  });

  test('Rejects invalid phone number (too short)', () => {
    const res = normalizePhoneNumber('12345');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.normalized, null);
  });

  test('Masks phone number for privacy', () => {
    const masked = maskPhoneNumber('+919876543210');
    assert.strictEqual(masked.includes('****'), true);
    assert.strictEqual(masked.endsWith('3210'), true);
  });

  // ── 2. Segment & Encoding Calculation ─────────────────────────────────────
  console.log('\n📦 [2/6] SMS Encoding & Segment Calculation Tests');

  test('Calculates 1 segment for short GSM-7 message', () => {
    const res = calculateSmsSegments('Hello Church Family!');
    assert.strictEqual(res.encoding, 'GSM-7');
    assert.strictEqual(res.segments, 1);
  });

  test('Detects UCS-2 Unicode encoding for Telugu / Emoji characters', () => {
    const res = calculateSmsSegments('యేసుక్రీస్తు ప్రభువు 🙏');
    assert.strictEqual(res.encoding, 'UCS-2');
    assert.strictEqual(res.segments, 1);
  });

  // ── 3. Template Rendering Tests ───────────────────────────────────────────
  console.log('\n📦 [3/6] Dynamic Church Template Tests');

  test('Renders EVENT_CREATED template with proper details', () => {
    const rendered = renderSmsTemplate('EVENT_CREATED', {
      title: 'Sunday Service',
      date: '2026-08-30',
      time: '9:00 AM',
      location: 'KCM Hyderabad',
    });
    assert.strictEqual(rendered.includes('Sunday Service'), true);
    assert.strictEqual(rendered.includes('KCM Hyderabad'), true);
    assert.strictEqual(rendered.includes('KCM Ministries'), true);
  });

  test('Renders DONATION_CONFIRMATION template', () => {
    const rendered = renderSmsTemplate('DONATION_CONFIRMATION', {
      amount: 1500,
      receiptNumber: 'KCM-RCP-12345',
    });
    assert.strictEqual(rendered.includes('₹1500'), true);
    assert.strictEqual(rendered.includes('KCM-RCP-12345'), true);
  });

  test('Interpolates custom admin variables', () => {
    const template = 'Greetings {{name}} from {{church}}!';
    const result = interpolate(template, { name: 'Brother David', church: 'KCM Ministries' });
    assert.strictEqual(result, 'Greetings Brother David from KCM Ministries!');
  });

  // ── 4. Exponential Backoff & Retry Logic Tests ────────────────────────────
  console.log('\n📦 [4/6] Exponential Backoff & Error Classification Tests');

  test('Backoff delay increases exponentially with attempt number', () => {
    const d1 = calculateBackoffDelay(1, 1000);
    const d2 = calculateBackoffDelay(2, 1000);
    const d3 = calculateBackoffDelay(3, 1000);

    assert.strictEqual(d1 >= 1000, true);
    assert.strictEqual(d2 >= 2000, true);
    assert.strictEqual(d3 >= 4000, true);
  });

  test('Correctly identifies retryable vs permanent error codes', () => {
    assert.strictEqual(isRetryableError(SMS_ERROR_CODE.TRANSIENT_ERROR), true);
    assert.strictEqual(isRetryableError(SMS_ERROR_CODE.RATE_LIMIT_ERROR), true);
    assert.strictEqual(isRetryableError(SMS_ERROR_CODE.INVALID_NUMBER), false);
    assert.strictEqual(isRetryableError(SMS_ERROR_CODE.AUTH_ERROR), false);
  });

  test('Classifies HTTP 429 as RATE_LIMIT_ERROR', () => {
    const code = classifyProviderError(new Error('Too many requests'), 429);
    assert.strictEqual(code, SMS_ERROR_CODE.RATE_LIMIT_ERROR);
  });

  // ── 5. MockSMSProvider Integration Tests ──────────────────────────────────
  console.log('\n📦 [5/6] MockSMSProvider Engine Tests');

  await asyncTest('MockSMSProvider dispatches SMS and returns valid provider ID', async () => {
    const provider = new MockSMSProvider({ simulatedDelayMs: 10 });
    const result = await provider.sendSMS({
      to: '+919876543210',
      message: 'Test message for unit test',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, SMS_STATUS.SENT);
    assert.strictEqual(typeof result.providerMessageId, 'string');
    assert.strictEqual(result.providerMessageId.startsWith('mock_'), true);
  });

  await asyncTest('MockSMSProvider queries message status', async () => {
    const provider = new MockSMSProvider({ simulatedDelayMs: 5 });
    const sendRes = await provider.sendSMS({ to: '+919876543210', message: 'Status check' });
    const statusRes = await provider.getMessageStatus(sendRes.providerMessageId);

    assert.strictEqual(statusRes.providerMessageId, sendRes.providerMessageId);
    assert.strictEqual(statusRes.status, SMS_STATUS.SENT);
  });

  // ── 6. Rate Limiter Tests ─────────────────────────────────────────────────
  console.log('\n📦 [6/6] Token Bucket Rate Limiter Tests');

  test('Rate limiter permits sends within limit and throttles when exceeded', () => {
    const limiter = new SMSRateLimiter(3);
    assert.strictEqual(limiter.canSend(), true);
    limiter.recordSend();
    assert.strictEqual(limiter.canSend(), true);
    limiter.recordSend();
    assert.strictEqual(limiter.canSend(), true);
    limiter.recordSend();

    // 4th send exceeds limit of 3
    assert.strictEqual(limiter.canSend(), false);
    assert.strictEqual(limiter.getWaitTimeMs() > 0, true);
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('─────────────────────────────────────────────────────────────────\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL SMS DELIVERY ENGINE UNIT & INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Unexpected test suite crash:', err);
  process.exit(1);
});
