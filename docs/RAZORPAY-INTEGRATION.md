# Razorpay Integration Guide

## 1. Gateway Overview

Kingdom of Christ Ministries utilizes **Razorpay Payment Gateway** supporting:
- UPI Intent & Dynamic QR flows (GPay, PhonePe, Paytm, BHIM, FamApp)
- Credit / Debit Cards
- Netbanking
- Wallets

---

## 2. Environment Variables Configuration

```bash
# Server-Side Private Secrets (NEVER expose to client bundle)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# Public-Facing Client Key (Allowed for Checkout SDK modal only)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
```

> **WARNING**: Never set `NEXT_PUBLIC_RAZORPAY_KEY_SECRET` or `NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET`.

---

## 3. Razorpay Dashboard Configuration

### Webhook Setup:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** -> **Webhooks** -> **Add New Webhook**.
3. **Webhook URL**: `https://kcmchurch.vercel.app/api/webhooks/razorpay`
4. **Secret**: Enter a cryptographically random 32+ character string and set it in your Vercel Environment Variables as `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events**:
   - `payment.captured`
   - `payment.failed`
   - `payment.authorized`
   - `order.paid`
   - `payment.refunded`
   - `refund.created`

---

## 4. Payment Flow Lifecycle

### Step 1: Order Creation (Server-Side)
```typescript
const order = await razorpay.orders.create({
  amount: amountInPaise, // e.g. 100000 paise = ₹1000.00
  currency: 'INR',
  receipt: 'KCM-ORD-20260901-XXXX',
  notes: {
    purpose: 'TITHE',
    donorName: 'Rahul Gamer',
  },
});
```

### Step 2: Client-Side Checkout
```typescript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  order_id: order.id,
  name: 'Kingdom of Christ Ministries',
  handler: function (response) {
    // Send to backend for cryptographic signature verification
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      }),
    });
  },
};
```

### Step 3: Signature Verification
```typescript
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(generatedSignature, 'hex'),
  Buffer.from(razorpaySignature, 'hex')
);
```
