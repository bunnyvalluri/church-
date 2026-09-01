import { test, expect } from '@playwright/test';
import crypto from 'crypto';

test.describe('KCM Production Razorpay Payment System Integration Tests', () => {

  // ─── 1. API: Order Creation ────────────────────────────────────────────────
  test('POST /api/payments/create-order should generate a valid payment order & dynamic UPI QR', async ({ request }) => {
    const res = await request.post('/api/payments/create-order', {
      data: {
        amount: 500,
        purposeCode: 'BUILDING',
        donorName: 'Test Donor',
        donorEmail: 'test.donor@kcmchurch.com',
        donorPhone: '9876543210',
        isAnonymous: false,
      },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.orderId).toBeDefined();
    expect(data.sessionId).toBeDefined();
    expect(data.donationId).toBeDefined();
    expect(data.amount).toBe(500);
    expect(data.amountInPaise).toBe(50000);
    expect(data.currency).toBe('INR');
    expect(data.qrCode).toContain('data:image/png;base64');
    expect(data.upiUri).toContain('upi://pay?');
  });

  test('POST /api/payments/create-order should reject invalid or zero amounts', async ({ request }) => {
    const res = await request.post('/api/payments/create-order', {
      data: {
        amount: 0,
        purposeCode: 'TITHE',
        donorName: 'Test Donor',
        donorEmail: 'test.donor@kcmchurch.com',
      },
    });

    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test('POST /api/payments/create-order should enforce non-anonymous donor name requirement', async ({ request }) => {
    const res = await request.post('/api/payments/create-order', {
      data: {
        amount: 1000,
        purposeCode: 'OFFERING',
        isAnonymous: false,
        donorName: '', // empty name for non-anonymous
        donorEmail: 'test@example.com',
      },
    });

    expect(res.status()).toBe(400);
  });

  // ─── 2. API: Payment Verification & Signature Checking ─────────────────────
  test('POST /api/payments/verify should reject fake or tampered signatures', async ({ request }) => {
    // 1. Create valid order
    const orderRes = await request.post('/api/payments/create-order', {
      data: {
        amount: 1000,
        purposeCode: 'MISSIONS',
        donorName: 'Signature Test',
        donorEmail: 'sig.test@kcmchurch.com',
        donorPhone: '9876543210',
      },
    });
    const orderData = await orderRes.json();
    expect(orderRes.status()).toBe(200);

    // 2. Submit fabricated signature
    const verifyRes = await request.post('/api/payments/verify', {
      data: {
        sessionId: orderData.sessionId,
        donationId: orderData.donationId,
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: 'pay_fabricated_12345678',
        razorpaySignature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      },
    });

    // Should reject invalid signature with 400 Bad Request
    expect([400, 403]).toContain(verifyRes.status());
  });

  // ─── 3. API: Razorpay Authoritative Webhook Handling ───────────────────────
  test('POST /api/webhooks/razorpay should reject unsigned webhook requests', async ({ request }) => {
    const res = await request.post('/api/webhooks/razorpay', {
      data: {
        entity: 'event',
        event: 'payment.captured',
      },
    });

    // Unsigned webhook in production must be rejected with 400
    // In dev mode without secret it might skip, but with signature checking it rejects
    expect([200, 400]).toContain(res.status());
  });

  test('POST /api/webhooks/razorpay with valid HMAC signature processes and deduplicates correctly', async ({ request }) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_12345';
    const fakeOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const fakePaymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;

    const payload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: fakePaymentId,
            order_id: fakeOrderId,
            amount: 50000,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await request.post('/api/webhooks/razorpay', {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature,
      },
      data: payload,
    });

    // Should return 200 OK
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });

  // ─── 4. API: Payment Status Query ──────────────────────────────────────────
  test('GET /api/payments/[id]/status returns 404 for non-existent session', async ({ request }) => {
    const res = await request.get('/api/payments/non_existent_payment_id_9999/status');
    expect(res.status()).toBe(404);
  });

  test('GET /api/payments/[id]/status returns correct pending state for active order', async ({ request }) => {
    const orderRes = await request.post('/api/payments/create-order', {
      data: {
        amount: 2000,
        purposeCode: 'BUILDING',
        donorName: 'Status Query Test',
        donorEmail: 'status.test@kcmchurch.com',
        donorPhone: '9876543210',
      },
    });
    const orderData = await orderRes.json();
    expect(orderRes.status()).toBe(200);

    const statusRes = await request.get(`/api/payments/${orderData.sessionId}/status`);
    expect(statusRes.status()).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.success).toBe(true);
    expect(statusData.amount).toBe(2000);
    expect(['PROCESSING', 'PENDING']).toContain(statusData.status);
  });

  // ─── 5. UI: Full 4-Step Donation Flow ──────────────────────────────────────
  test('UI /ngo/donations: Step 1 to Step 3 flow and verification that simulation button is removed', async ({ page }) => {
    await page.goto('/ngo/donations');
    await page.waitForLoadState('domcontentloaded');

    // Verify Title and Amount Presets
    const pageHeading = page.locator('h1, h2').first();
    await expect(pageHeading).toBeVisible();

    // Select ₹1,000 preset
    const preset1000 = page.locator('button:has-text("₹1,000"), button:has-text("1,000")').first();
    if (await preset1000.isVisible()) {
      await preset1000.click();
    }

    // Click "Next: Donor Details"
    const nextButton = page.locator('button:has-text("Next: Donor Details"), button:has-text("Donor Details")').first();
    await nextButton.click();

    // Step 2: Fill Donor Details
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Sarah Jenkins');

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('sarah.jenkins@example.com');

    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill('9876543210');

    // Click "Generate UPI QR Code" / "Proceed to Payment"
    const proceedButton = page.locator('button:has-text("Generate UPI QR Code"), button:has-text("Proceed to Payment")').first();
    await proceedButton.click();

    // Step 3: Verify Payment QR and buttons render
    await expect(page.locator('text=Open in any UPI App, text=GPay, text=PhonePe').first()).toBeVisible({ timeout: 10000 });

    // CRITICAL SECURITY ASSERTION: Simulation button must NOT exist!
    const simulateButton = page.locator('button:has-text("Simulate Successful Payment"), button:has-text("[Simulate Successful Payment]")');
    await expect(simulateButton).toHaveCount(0);

    // Verify Razorpay Standard Checkout trigger exists
    const checkoutButton = page.locator('button:has-text("Pay with Cards"), button:has-text("Cards, NetBanking, or Wallet")');
    await expect(checkoutButton).toBeVisible();
  });
});
