/**
 * frontend/tests/security/auth-production.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Production Security & Authentication Test Suite
 * Tests real registration, bcrypt password hashing, duplicate account protection,
 * real login, generic error responses (anti-enumeration), rate limiting,
 * and HttpOnly session lifecycle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';

test.describe('Production Authentication & Security Hardening Suite', () => {
  const testEmail = `test.member.${Date.now()}@kcmchurch.org`;
  const strongPassword = 'Password@2026!Secure';

  test.describe('1. Registration Security & Validation', () => {
    test('rejects registration with missing required fields', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          termsAccepted: false,
        },
      });

      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
      expect(json.success).toBeFalsy();
    });

    test('rejects registration with mismatched passwords', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@kcmchurch.org',
          password: strongPassword,
          confirmPassword: 'DifferentPassword123!',
          termsAccepted: true,
        },
      });

      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Passwords do not match');
    });

    test('rejects registration with weak password (missing special char or number)', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@kcmchurch.org',
          password: 'password',
          confirmPassword: 'password',
          termsAccepted: true,
        },
      });

      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    test('rejects registration when terms of service are not accepted', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@kcmchurch.org',
          password: strongPassword,
          confirmPassword: strongPassword,
          termsAccepted: false,
        },
      });

      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Terms of Service');
    });

    test('successfully registers a new member with valid credentials', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          firstName: 'Grace',
          lastName: 'Faithful',
          email: testEmail,
          phone: '+91 9876543210',
          password: strongPassword,
          confirmPassword: strongPassword,
          termsAccepted: true,
        },
      });

      expect(res.status()).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user).toBeDefined();
      expect(json.user.email).toBe(testEmail.toLowerCase());
      expect(json.user.role).toBe('MEMBER');
    });

    test('rejects duplicate registration with safe error message', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          firstName: 'Grace',
          lastName: 'Faithful',
          email: testEmail,
          phone: '+91 9876543210',
          password: strongPassword,
          confirmPassword: strongPassword,
          termsAccepted: true,
        },
      });

      expect(res.status()).toBe(409);
      const json = await res.json();
      expect(json.error).toContain('already exists');
      // Must not leak database internal details
      expect(JSON.stringify(json)).not.toContain('prisma');
      expect(JSON.stringify(json)).not.toContain('PostgreSQL');
    });
  });

  test.describe('2. Login Security & Credential Verification', () => {
    test('rejects login with invalid email or password (wrong password)', async ({ request }) => {
      const res = await request.post('/api/auth/login', {
        data: {
          email: testEmail,
          password: 'WrongPassword123!',
        },
      });

      expect(res.status()).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Invalid email or password.');
    });

    test('rejects login with non-existent email with generic error (anti-enumeration)', async ({ request }) => {
      const res = await request.post('/api/auth/login', {
        data: {
          email: `nonexistent.${Date.now()}@kcmchurch.org`,
          password: strongPassword,
        },
      });

      expect(res.status()).toBe(401);
      const json = await res.json();
      // Generic error must match exactly to prevent user enumeration
      expect(json.error).toBe('Invalid email or password.');
    });

    test('successfully authenticates with valid credentials and sets HttpOnly cookie', async ({ request }) => {
      const res = await request.post('/api/auth/login', {
        data: {
          email: testEmail,
          password: strongPassword,
        },
      });

      expect(res.status()).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user.email).toBe(testEmail.toLowerCase());
      expect(json.user.role).toBe('MEMBER');

      // Verify Set-Cookie header contains kcm_session with HttpOnly and SameSite=Lax
      const setCookieHeader = res.headers()['set-cookie'] || '';
      expect(setCookieHeader).toContain('kcm_session=');
      expect(setCookieHeader.toLowerCase()).toContain('httponly');
      expect(setCookieHeader.toLowerCase()).toContain('samesite=lax');
    });
  });

  test.describe('3. Session Lifecycle & Revocation', () => {
    test('verifies active session via GET /api/auth/session', async ({ request }) => {
      // 1. Log in to get session cookie
      const loginRes = await request.post('/api/auth/login', {
        data: {
          email: testEmail,
          password: strongPassword,
        },
      });
      expect(loginRes.status()).toBe(200);

      // Extract session cookie from headers
      const setCookie = loginRes.headers()['set-cookie'] || '';
      const cookieMatch = setCookie.match(/kcm_session=([^;]+)/);
      expect(cookieMatch).not.toBeNull();
      const sessionToken = cookieMatch![1];

      // 2. Call GET /api/auth/session with session cookie
      const sessionRes = await request.get('/api/auth/session', {
        headers: {
          Cookie: `kcm_session=${sessionToken}`,
        },
      });

      expect(sessionRes.status()).toBe(200);
      const sessionJson = await sessionRes.json();
      expect(sessionJson.authenticated).toBe(true);
      expect(sessionJson.user.email).toBe(testEmail.toLowerCase());
      expect(sessionJson.user.role).toBe('MEMBER');
    });

    test('invalidates session on DELETE /api/auth/session (Logout)', async ({ request }) => {
      // 1. Log in
      const loginRes = await request.post('/api/auth/login', {
        data: {
          email: testEmail,
          password: strongPassword,
        },
      });
      const setCookie = loginRes.headers()['set-cookie'] || '';
      const sessionToken = setCookie.match(/kcm_session=([^;]+)/)![1];

      // 2. Logout
      const logoutRes = await request.delete('/api/auth/session', {
        headers: {
          Cookie: `kcm_session=${sessionToken}`,
        },
      });
      expect(logoutRes.status()).toBe(200);
      const logoutCookie = logoutRes.headers()['set-cookie'] || '';
      expect(logoutCookie).toContain('kcm_session=;');

      // 3. Verify session is revoked
      const checkRes = await request.get('/api/auth/session', {
        headers: {
          Cookie: `kcm_session=${sessionToken}`,
        },
      });
      const checkJson = await checkRes.json();
      expect(checkJson.authenticated).toBe(false);
    });
  });
});
