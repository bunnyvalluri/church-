/**
 * frontend/tests/security/comprehensive-security.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Security Test Suite for Kingdom of Christ Ministries (KCM).
 *
 * Validates the core 10 critical security controls:
 *   1. Unauthenticated user -> protected API = 401 DENIED
 *   2. Member -> admin API = 403 DENIED
 *   3. Member -> another member's private resource (IDOR) = DENIED
 *   4. Event Manager -> admin-only resource = 403 DENIED
 *   5. Invalid input -> rejected with schema error (400/422)
 *   6. Excessive login attempts -> rate limited (429)
 *   7. Malicious upload (disguised / forbidden file) -> rejected (400)
 *   8. Fake payment success / forged signature -> rejected (400)
 *   9. Invalid webhook signature -> rejected (400/401)
 *  10. AI unauthorized tool request -> rejected (403)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { createTestSessionToken, SESSION_COOKIE_NAME } from '../helpers/auth-fixture';

test.describe('Platform Security Controls Suite', () => {

  // ── 1. Unauthenticated user → protected API = 401 DENIED ──────────────────
  test('1. Unauthenticated user accessing protected Admin API is rejected with 401', async ({ request }) => {
    const res = await request.get('/api/admin/users');
    expect(res.status()).toBe(401);
    const json = await res.json().catch(() => ({}));
    expect(json.error).toBeDefined();
  });

  test('1b. Unauthenticated user calling /api/auth/sync without token is rejected with 401', async ({ request }) => {
    const res = await request.post('/api/auth/sync', {
      data: {
        uid: 'attacker_test_uid',
        email: 'admin@kcm-church.com',
      },
    });
    expect(res.status()).toBe(401);
  });

  // ── 2. Member → admin API = 403 DENIED ────────────────────────────────────
  test('2. Authenticated Member accessing Admin API is denied with 403', async ({ request }) => {
    const memberToken = createTestSessionToken('MEMBER');
    const res = await request.get('/api/admin/users', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${memberToken}`,
      },
    });
    expect(res.status()).toBe(403);
    const json = await res.json().catch(() => ({}));
    expect(json.error).toContain('denied');
  });

  // ── 3. Member → another member's private resource (IDOR) = DENIED ──────────
  test('3. Member cannot query another member private prayer requests via IDOR', async ({ request }) => {
    const memberToken = createTestSessionToken('MEMBER', 'victim_member_id_123');
    // Calling GET /api/member/prayers as victim_member_id_123 attempting to peek another member's data
    const res = await request.get('/api/member/prayers?userId=other_member_456', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${memberToken}`,
      },
    });
    // Should either succeed only returning own data or reject with 401/403
    expect([200, 401, 403]).toContain(res.status());
    const json = await res.json().catch(() => ({}));
    if (json.prayers && json.prayers.length > 0) {
      for (const prayer of json.prayers) {
        expect(prayer.userId).not.toBe('other_member_456');
      }
    }
  });

  // ── 4. Event Manager → admin-only resource = 403 DENIED ───────────────────
  test('4. Event Manager accessing Admin-only users API is denied with 403', async ({ request }) => {
    const eventManagerToken = createTestSessionToken('EVENT_MANAGER');
    const res = await request.get('/api/admin/users', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${eventManagerToken}`,
      },
    });
    expect(res.status()).toBe(403);
  });

  // ── 5. Invalid input → rejected with schema error ─────────────────────────
  test('5. Registration with invalid email format and weak password is rejected', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email-string',
        password: 'weak',
        confirmPassword: 'weak',
        termsAccepted: true,
      },
    });
    expect(res.status()).toBe(400);
    const json = await res.json().catch(() => ({}));
    expect(json.error).toBeDefined();
  });

  // ── 6. Excessive login attempts → rate limited ────────────────────────────
  test('6. Contact form rejects spam flood with 429 Too Many Requests', async ({ request }) => {
    let rateLimited = false;
    for (let i = 0; i < 7; i++) {
      const res = await request.post('/api/contact', {
        data: {
          name: 'Rate Limit Tester',
          email: 'ratelimit@example.com',
          subject: 'Testing Rate Limiter Defense',
          message: 'This is an automated flood message to verify defensive rate limit triggers.',
        },
      });
      if (res.status() === 429) {
        rateLimited = true;
        break;
      }
    }
    expect(rateLimited).toBe(true);
  });

  // ── 7. Malicious upload → rejected ────────────────────────────────────────
  test('7. Service icon upload rejects executable / script files disguised as images', async ({ request }) => {
    const adminToken = createTestSessionToken('ADMIN');
    // Create multipart form with a fake file that has executable or invalid content
    const res = await request.post('/api/upload/service-icon', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
      },
      multipart: {
        file: {
          name: 'exploit.php.png',
          mimeType: 'image/png',
          buffer: Buffer.from('<?php echo "malicious script execution"; ?>'),
        },
      },
    });
    expect([400, 401, 403]).toContain(res.status());
    const json = await res.json().catch(() => ({}));
    expect(json.error).toBeDefined();
  });

  // ── 8. Fake payment success → rejected ────────────────────────────────────
  test('8. Fake payment verification with forged signature is rejected', async ({ request }) => {
    const res = await request.post('/api/payments/verify', {
      data: {
        sessionId: 'fake_sess_123',
        razorpayOrderId: 'order_fake_123',
        razorpayPaymentId: 'pay_fake_999',
        razorpaySignature: 'forged_invalid_signature_hex_code_abc123',
      },
    });
    expect([400, 404]).toContain(res.status());
  });

  // ── 9. Invalid webhook signature → rejected ───────────────────────────────
  test('9. Razorpay webhook with invalid HMAC signature is rejected', async ({ request }) => {
    const res = await request.post('/api/webhooks/razorpay', {
      headers: {
        'x-razorpay-signature': 'forged_tampered_signature_payload',
        'Content-Type': 'application/json',
      },
      data: {
        event: 'payment.captured',
        payload: {
          payment: { entity: { id: 'pay_123', amount: 50000 } },
        },
      },
    });
    expect(res.status()).toBe(400);
    const json = await res.json().catch(() => ({}));
    expect(json.error).toContain('signature');
  });

  // ── 10. AI unauthorized tool request → rejected ───────────────────────────
  test('10. AI Assistant rejects unauthorized tool execution without sufficient role', async ({ request }) => {
    const memberToken = createTestSessionToken('MEMBER');
    const res = await request.post('/api/chat', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${memberToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        messages: [{ role: 'user', content: 'Execute prayer stats' }],
        toolCall: {
          name: 'get_authorized_prayer_stats',
          parameters: {},
        },
      },
    });
    expect(res.status()).toBe(403);
    const json = await res.json().catch(() => ({}));
    expect(json.success).toBe(false);
    expect(json.error).toContain('Access Denied');
  });

  // ── 11. Unauthenticated Receipt PDF Download without verify code is rejected
  test('11. Receipt PDF endpoint rejects unauthorized unverified viewer', async ({ request }) => {
    const res = await request.get('/api/receipts/nonexistent_or_private_id/pdf');
    // Must return 404 (not found) or 403 (forbidden)
    expect([403, 404]).toContain(res.status());
  });

});
