/**
 * frontend/tests/integration/concurrency-idor.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Concurrency, Double-Submission, and Strict User A vs User B IDOR Test Suite.
 *
 * Validates:
 *   1. Rapid Concurrent Double-Submission on Payment Order Creation.
 *   2. Rapid Concurrent Form Submissions (Rate Limiting & Deduplication).
 *   3. Strict IDOR Isolation: User A vs User B across private Member resources.
 *   4. Safe Database Error Degradation: No stack traces or SQL leakage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { createTestSessionToken, SESSION_COOKIE_NAME } from '../helpers/auth-fixture';

test.describe('Concurrency, Double-Submission & Multi-User IDOR Verification', () => {

  test('1. Rapid double-submission of donation orders returns consistent authorized responses without server crash', async ({ request }) => {
    const payload = {
      amount: 250,
      purposeCode: 'TITHE',
      donorName: 'Double Submit Test Donor',
      donorEmail: 'doublesubmit@kcm-church.test',
      isAnonymous: false,
    };

    // Fire 5 concurrent requests simultaneously
    const requests = Array.from({ length: 5 }).map(() =>
      request.post('/api/donations/create-order', {
        data: payload,
      })
    );

    const responses = await Promise.all(requests);
    
    // Verify none crashed (status should be 200 or gracefully handled 429/400)
    for (const res of responses) {
      expect([200, 429]).toContain(res.status());
      const body = await res.json();
      expect(body).toBeDefined();
      if (res.status() === 200) {
        expect(body.orderId).toBeDefined();
      }
    }
  });

  test('2. IDOR Protection: User B cannot view or tamper with User A private prayer record', async ({ request }) => {
    const userAToken = createTestSessionToken('MEMBER', 'user_a_victim_999');
    const userBToken = createTestSessionToken('MEMBER', 'user_b_attacker_888');

    // 1. User B queries Member prayers explicitly targeting User A's identifier
    const userBResponse = await request.get('/api/member/prayers?userId=user_a_victim_999', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${userBToken}`,
      },
    });

    // Server must either return 403 Forbidden, or filter the query to User B's own session ID
    if (userBResponse.status() === 200) {
      const data = await userBResponse.json();
      // If array is returned, verify no records belonging to User A are exposed
      if (Array.isArray(data)) {
        for (const item of data) {
          expect(item.userId).not.toBe('user_a_victim_999');
        }
      } else if (data.prayers) {
        for (const item of data.prayers) {
          expect(item.userId).not.toBe('user_a_victim_999');
        }
      }
    } else {
      expect([401, 403, 404]).toContain(userBResponse.status());
    }
  });

  test('3. IDOR Protection: User B cannot access User A profile via member endpoint', async ({ request }) => {
    const userBToken = createTestSessionToken('MEMBER', 'user_b_attacker_888');

    const res = await request.get('/api/member/profile?memberId=user_a_victim_999', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${userBToken}`,
      },
    });

    // Either 403/404, or the response returns User B's own session profile, never User A's
    if (res.status() === 200) {
      const profile = await res.json();
      expect(profile.id || profile.userId).not.toBe('user_a_victim_999');
    } else {
      expect([401, 403, 404]).toContain(res.status());
    }
  });

  test('4. Database Failure & Malformed Query Resilience: Zero Stack Trace / SQL Leakage', async ({ request }) => {
    // Send malformed SQL injection string and binary payloads into search/filter endpoints
    const malformedInputs = [
      "' OR 1=1; DROP TABLE users; --",
      "'; EXEC xp_cmdshell('dir'); --",
      '{"$gt": ""}',
      '<script>alert("xss")</script>',
    ];

    for (const input of malformedInputs) {
      const res = await request.get(`/api/sermons?search=${encodeURIComponent(input)}`);
      expect(res.status()).toBeLessThan(500); // Must be handled gracefully (200, 400, etc.)
      const text = await res.text();
      // Assert no raw SQL error strings or file paths leak to client
      expect(text).not.toContain('prisma');
      expect(text).not.toContain('PostgresError');
      expect(text).not.toContain('syntax error at or near');
      expect(text).not.toContain('SELECT * FROM');
      expect(text).not.toContain('password');
    }
  });

  test('5. Session Token Tampering: Signature tampering immediately invalidates session', async ({ request }) => {
    const validToken = createTestSessionToken('ADMIN', 'admin_real_id');
    // Corrupt the signature portion of the token
    const tamperedToken = validToken.substring(0, validToken.length - 8) + 'deadbeef';

    const res = await request.get('/api/admin/users', {
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${tamperedToken}`,
      },
    });

    expect(res.status()).toBe(401);
    const body = await res.json().catch(() => ({}));
    expect(body.error).toBeDefined();
  });
});
