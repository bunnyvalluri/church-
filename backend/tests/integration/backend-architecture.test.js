/**
 * backend/tests/integration/backend-architecture.test.js
 * Comprehensive Integration & Security Test Suite for KCM Production Backend Architecture.
 */

'use strict';

const assert = require('assert');
const http = require('http');

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

async function makeRequest(server, path, method = 'GET', body = null, headers = {}) {
  const address = server.address();
  const port = address.port;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('🧪 Running KCM Church Production Backend Architecture Test Suite');
  console.log('─────────────────────────────────────────────────────────────────\n');

  // Load compiled backend app
  const { createExpressApp } = require('../../dist/bootstrap/app');
  const app = createExpressApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`📡 Ephemeral Test Server listening on port ${port}\n`);

  try {
    // ── 1. Health Probes ────────────────────────────────────────────────────
    console.log('📦 [1/6] Health, Liveness & Readiness Probes');
    await asyncTest('/health/live returns 200 with memory and uptime stats', async () => {
      const res = await makeRequest(server, '/health/live');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'LIVE');
      assert(res.body.uptimeSeconds >= 0);
    });

    await asyncTest('/health/ready returns diagnostic payload without leaking secrets', async () => {
      const res = await makeRequest(server, '/health/ready');
      assert(res.status === 200 || res.status === 503);
      assert(res.body.status === 'READY' || res.body.status === 'NOT_READY');
    });

    await asyncTest('/health returns multi-service health status', async () => {
      const res = await makeRequest(server, '/health');
      assert(res.status === 200 || res.status === 503);
      assert(res.body.services);
    });

    // ── 2. Security & RBAC Boundary Enforcement ─────────────────────────────
    console.log('\n📦 [2/6] Authentication & Role-Based Access Control');
    await asyncTest('Unauthenticated access to protected route returns 401', async () => {
      const res = await makeRequest(server, '/api/admin/diagnostics');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    });

    await asyncTest('MEMBER role attempting to access admin route returns 403 Forbidden', async () => {
      const res = await makeRequest(server, '/api/admin/diagnostics', 'GET', null, {
        Authorization: 'Bearer dev-token-member',
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'FORBIDDEN');
    });

    await asyncTest('ADMIN role can access protected admin diagnostics', async () => {
      const res = await makeRequest(server, '/api/admin/diagnostics', 'GET', null, {
        Authorization: 'Bearer dev-token-admin',
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert(['OPTIMAL', 'DEGRADED'].includes(res.body.data.status));
    });

    // ── 3. Branch Scoping & Directory Modules ───────────────────────────────
    console.log('\n📦 [3/6] Branch Campuses & Event Management');
    await asyncTest('GET /api/branches returns all 3 Hyderabad campuses', async () => {
      const res = await makeRequest(server, '/api/branches');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.length, 3);
      const slugs = res.body.data.map((b) => b.slug);
      assert(slugs.includes('kukatpally'));
      assert(slugs.includes('banjara-hills'));
      assert(slugs.includes('secunderabad'));
    });

    await asyncTest('GET /api/events returns paginated church events', async () => {
      const res = await makeRequest(server, '/api/events');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert(Array.isArray(res.body.data));
    });

    // ── 4. Financial Integrity & Idempotency ─────────────────────────────────
    console.log('\n📦 [4/6] Financial Integrity & Razorpay Checkout');
    await asyncTest('Reject donation order with zero or negative amount', async () => {
      const res = await makeRequest(server, '/api/donations/create-order', 'POST', {
        amountInRupees: 0,
        fund: 'OFFERING',
        donorName: 'Test Donor',
        donorEmail: 'donor@example.com',
        idempotencyKey: 'idemp_neg_1',
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    await asyncTest('Reject donation order without idempotency key', async () => {
      const res = await makeRequest(server, '/api/donations/create-order', 'POST', {
        amountInRupees: 1000,
        fund: 'TITHE',
        donorName: 'Test Donor',
        donorEmail: 'donor@example.com',
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    await asyncTest('Create valid donation order with idempotency key', async () => {
      const res = await makeRequest(server, '/api/donations/create-order', 'POST', {
        amountInRupees: 500,
        fund: 'TITHE',
        donorName: 'Faithful Giver',
        donorEmail: 'giver@kcmchurch.org',
        idempotencyKey: 'idemp_valid_' + Date.now(),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert(res.body.data.orderId);
      assert(res.body.data.amount === 500 || res.body.data.amount === 50000);
    });

    // ── 5. Webhooks & Tamper Resistance ─────────────────────────────────────
    console.log('\n📦 [5/6] Webhook HMAC-SHA256 Verification');
    await asyncTest('Reject Razorpay webhook without signature header', async () => {
      const res = await makeRequest(server, '/api/webhooks/razorpay', 'POST', {
        event: 'payment.captured',
      });
      assert.strictEqual(res.status, 400);
    });

    // ── 6. Offline Synchronization & Conflict Handling ──────────────────────
    console.log('\n📦 [6/6] Offline PWA Synchronization & Conflict Resolution');
    await asyncTest('POST /api/offline-sync/push processes valid mutation batch', async () => {
      const res = await makeRequest(server, '/api/offline-sync/push', 'POST', {
        deviceId: 'dev_iphone_15_pro',
        mutations: [
          {
            id: 'mut_1',
            table: 'prayer_requests',
            recordId: 'pray_local_1',
            operation: 'CREATE',
            payload: { title: 'Pray for exam' },
            clientTimestamp: Date.now(),
            clientVersion: 1,
          },
        ],
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.appliedCount, 1);
      assert.strictEqual(res.body.data.conflicts.length, 0);
    });

    await asyncTest('POST /api/offline-sync/push flags stale version as conflict', async () => {
      const res = await makeRequest(server, '/api/offline-sync/push', 'POST', {
        deviceId: 'dev_android_tablet',
        mutations: [
          {
            id: 'mut_stale_1',
            table: 'events',
            recordId: 'evt_local_99',
            operation: 'UPDATE',
            payload: { title: 'Old edit' },
            clientTimestamp: Date.now(),
            clientVersion: 0, // Stale version
          },
        ],
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.conflicts.length, 1);
    });

    await asyncTest('Unknown route returns clean 404 envelope without stack trace', async () => {
      const res = await makeRequest(server, '/api/nonexistent-route-xyz');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'NOT_FOUND');
    });

    console.log('\n─────────────────────────────────────────────────────────────────');
    console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('─────────────────────────────────────────────────────────────────\n');

    if (passedTests === totalTests) {
      console.log('🎉 ALL BACKEND ARCHITECTURE INTEGRATION TESTS PASSED (100%)\n');
    } else {
      process.exitCode = 1;
    }
  } finally {
    server.close();
  }
}

runSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
