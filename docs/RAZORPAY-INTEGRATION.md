# Razorpay Integration Guide — Kingdom of Christ Ministries

## 1. Setup & Credentials

Configure environment variables in `.env.local` (local development) or Vercel Environment Variables (production):

```bash
# Server-only (NEVER prefix with NEXT_PUBLIC_)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxx"

# Client-accessible
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
```

> [!CAUTION]
> Never commit actual API keys or secrets to git. Server secrets must never be exported to the client bundle.

---

## 2. Order Creation Flow
Orders are created through `POST /api/payments/create-order`.

### Request Payload
```json
{
  "amount": 1000,
  "purposeCode": "BUILDING",
  "donorName": "Pastor David",
  "donorEmail": "david@kcmchurch.com",
  "donorPhone": "+919876543210",
  "isAnonymous": false,
  "panNumber": "ABCDE1234F"
}
```

### Server Execution:
```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const order = await razorpay.orders.create({
  amount: amountInPaise, // 100000 for ₹1000
  currency: 'INR',
  receipt: 'KCM-ORD-260901-XXXX',
  notes: {
    purpose: 'BUILDING',
    source: 'KCM_PORTAL',
  },
});
```

---

## 3. Client-Side Checkout Modal
On the frontend (`/ngo/donations` and `/give`), Razorpay standard checkout is launched dynamically:

```typescript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amountInPaise,
  currency: 'INR',
  name: 'Kingdom of Christ Ministries',
  description: 'Building Fund Donation',
  order_id: order.orderId,
  prefill: {
    name: donorName,
    email: donorEmail,
    contact: donorPhone,
  },
  theme: {
    color: '#4F1C91',
  },
  handler: async function (response) {
    // Forward response to backend for HMAC verification
    await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      }),
    });
  },
};

const rzp = new (window as any).Razorpay(options);
rzp.open();
```

---

## 4. Server-Side Signature Verification
When the client submits checkout parameters to `POST /api/payments/verify`, the backend calculates:

$$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$

Timing-safe verification:
```typescript
import crypto from 'crypto';

export function verifyRazorpayPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const a = Buffer.from(expectedSignature, 'hex');
  const b = Buffer.from(razorpaySignature, 'hex');

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
```

---

## 5. Razorpay Refunds API
Admins can trigger refunds from `/admin/finance/donations`:
```typescript
const refundResult = await razorpay.payments.refund(razorpayPaymentId, {
  amount: refundAmountPaise,
  speed: 'optimum',
  notes: {
    reason: 'Administrative correction',
    adminUserId: adminUser.uid,
  },
});
```
