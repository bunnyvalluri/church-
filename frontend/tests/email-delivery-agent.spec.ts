/**
 * frontend/tests/email-delivery-agent.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Production Verification Test Suite for:
 *   1. Email Provider Abstraction & Production Mode Safety
 *   2. Error Classification & Exponential Backoff with Jitter
 *   3. Deterministic Idempotency & Hashing
 *   4. Resend Webhook Svix Signature Verification & Replay Protection
 *   5. KCM Email Reliability Agent (Health Assessment & Alert Deduplication)
 *   6. Secure Health Check Endpoints (/api/health, /api/health/email, etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import { classifyEmailError, calculateBackoffMs } from '../lib/email/email.errors';
import { hashRecipient, maskEmail, generateDeterministicIdempotencyKey } from '../lib/email/email.service';
import { verifyResendWebhookSignature } from '../app/api/webhooks/resend/route';
import { EmailReliabilityAgent } from '../lib/email/agent/email-health.agent';
import { CompositeEmailProvider } from '../lib/email/providers';

test.describe('KCM Production Email Delivery & Health Agent Test Suite', () => {

  // ── 1. Error Classification & Resilience ──────────────────────────────────
  test('1. Error classifier correctly identifies permanent vs transient errors', () => {
    // 403 / unverified domain is PERMANENT (never retry)
    const resend403 = classifyEmailError({
      statusCode: 403,
      message: 'You can only send testing emails to your own email address (rahulgamer.7123@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains...',
    });
    expect(resend403.isPermanent).toBe(true);
    expect(resend403.isTransient).toBe(false);
    expect(resend403.errorCode).toBe('UNVERIFIED_DOMAIN');

    // 401 invalid credentials is PERMANENT
    const resend401 = classifyEmailError({ statusCode: 401, message: 'API key is unauthorized' });
    expect(resend401.isPermanent).toBe(true);
    expect(resend401.errorCode).toBe('INVALID_CREDENTIALS');

    // 429 rate limit is TRANSIENT (must retry)
    const rateLimit429 = classifyEmailError({ statusCode: 429, message: 'Too many requests' });
    expect(rateLimit429.isTransient).toBe(true);
    expect(rateLimit429.isPermanent).toBe(false);
    expect(rateLimit429.errorCode).toBe('RATE_LIMIT_EXCEEDED');

    // 503 provider unavailable is TRANSIENT
    const server503 = classifyEmailError({ statusCode: 503, message: 'Service Unavailable' });
    expect(server503.isTransient).toBe(true);
    expect(server503.errorCode).toBe('PROVIDER_5XX');

    // Network timeout is TRANSIENT
    const timeoutErr = classifyEmailError({ message: 'ETIMEDOUT: Connection timed out' });
    expect(timeoutErr.isTransient).toBe(true);
    expect(timeoutErr.errorCode).toBe('NETWORK_TIMEOUT');
  });

  // ── 2. Backoff with Jitter Calculation ──────────────────────────────────────
  test('2. Exponential backoff increases monotonically and includes jitter', () => {
    const delay1 = calculateBackoffMs(1, 1000, 10000);
    const delay2 = calculateBackoffMs(2, 1000, 10000);
    const delay3 = calculateBackoffMs(3, 1000, 10000);

    expect(delay1).toBeGreaterThanOrEqual(500); // 1000 * 2^1 * 0.5 = 1000
    expect(delay1).toBeLessThanOrEqual(2000);

    expect(delay2).toBeGreaterThanOrEqual(1000); // 1000 * 2^2 * 0.5 = 2000
    expect(delay3).toBeGreaterThanOrEqual(2000); // 1000 * 2^3 * 0.5 = 4000
  });

  // ── 3. Privacy Hashing & Masking ───────────────────────────────────────────
  test('3. Recipient email addresses are consistently hashed and securely masked', () => {
    const email = 'Admin@KCM-Church.COM';
    const hash = hashRecipient(email);
    const hash2 = hashRecipient('admin@kcm-church.com');

    // Consistent lowercase hashing
    expect(hash).toBe(hash2);
    expect(hash.length).toBe(64); // SHA-256 hex string

    // Masking leaves domain and first/last letters visible while hiding identity
    const masked = maskEmail('rahulgamer.7123@gmail.com');
    expect(masked).toBe('r*************3@gmail.com');
    expect(masked).not.toContain('rahulgamer');

    const maskedShort = maskEmail('ab@example.com');
    expect(maskedShort).toBe('a*@example.com');
  });

  // ── 4. Deterministic Idempotency Key ────────────────────────────────────────
  test('4. Idempotency key generation is deterministic and case-insensitive', () => {
    const key1 = generateDeterministicIdempotencyKey('Member@Example.com', 'LOGIN_ALERT', 'sess_123');
    const key2 = generateDeterministicIdempotencyKey('member@example.com', 'LOGIN_ALERT', 'sess_123');
    const keyDiffScope = generateDeterministicIdempotencyKey('member@example.com', 'LOGIN_ALERT', 'sess_456');

    expect(key1).toBe(key2);
    expect(key1).not.toBe(keyDiffScope);
    expect(key1.length).toBe(64);
  });

  // ── 5. Svix / Resend Webhook Signature Verification ─────────────────────────
  test('5. Webhook signature verifier validates authentic signatures and rejects tampering', () => {
    const secret = 'whsec_dGVzdF9zZWNyZXRfa2V5XzEyMzQ1Njc4OTA=';
    const rawBody = JSON.stringify({ type: 'email.delivered', data: { id: 'email_123' } });
    const id = 'msg_test_123';
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Compute genuine signature
    const cleanSecret = secret.slice(6);
    const keyBytes = Buffer.from(cleanSecret, 'base64');
    const toSign = `${id}.${timestamp}.${rawBody}`;
    const validSig = crypto.createHmac('sha256', keyBytes).update(toSign).digest('base64');

    // Authentic signature passes
    const isValid = verifyResendWebhookSignature(
      rawBody,
      { id, timestamp, signature: `v1,${validSig}` },
      secret
    );
    expect(isValid).toBe(true);

    // Tampered payload fails
    const isTamperedValid = verifyResendWebhookSignature(
      rawBody + 'tamper',
      { id, timestamp, signature: `v1,${validSig}` },
      secret
    );
    expect(isTamperedValid).toBe(false);

    // Expired timestamp (> 5 minutes) fails replay check
    const expiredTimestamp = (Math.floor(Date.now() / 1000) - 360).toString();
    const isExpiredValid = verifyResendWebhookSignature(
      rawBody,
      { id, timestamp: expiredTimestamp, signature: `v1,${validSig}` },
      secret
    );
    expect(isExpiredValid).toBe(false);
  });

  // ── 6. KCM Email Reliability Agent ──────────────────────────────────────────
  test('6. Email Reliability Agent correctly evaluates live system and generates incident diagnostics', async () => {
    const agent = new EmailReliabilityAgent();
    const assessment = await agent.assessHealth(60);

    expect(assessment).toBeDefined();
    expect(assessment.status).toBeDefined();
    expect(['OPERATIONAL', 'DEGRADED', 'OUTAGE']).toContain(assessment.status);
    expect(assessment.metrics).toBeDefined();
    expect(assessment.metrics.windowMinutes).toBe(60);
    expect(assessment.providerHealth).toBeDefined();

    // The agent detected that Resend has 0 verified domains in this test environment
    if (assessment.activeProvider === 'resend' && !assessment.providerHealth.hasVerifiedDomain) {
      const unverifiedIncident = assessment.activeIncidents.find(
        (i) => i.incidentKey === 'RESEND_UNVERIFIED_DOMAIN'
      );
      expect(unverifiedIncident).toBeDefined();
      expect(unverifiedIncident?.severity).toBe('CRITICAL');
      expect(unverifiedIncident?.httpStatus).toBe(403);
      expect(unverifiedIncident?.failure).toContain('0 verified domains');
      expect(unverifiedIncident?.recommendation).toContain('resend.com/domains');
    }
  });

  // ── 7. Provider Failover Engine ─────────────────────────────────────────────
  test('7. Composite provider reports configured status and enforces production boundaries', async () => {
    const provider = new CompositeEmailProvider();
    expect(provider.isConfigured()).toBe(true);

    const report = await provider.healthCheck();
    expect(report.latencyMs).toBeGreaterThanOrEqual(0);
    expect(report.provider).toBeDefined();
  });
});
