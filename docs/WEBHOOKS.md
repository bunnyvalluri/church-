# Razorpay Webhook Integration Guide

## 1. Webhook Setup in Razorpay Dashboard
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** → **Webhooks** → **Add New Webhook**.
3. **Webhook URL**: `https://kcmchurch.vercel.app/api/webhooks/razorpay` (or `https://kcmchurch.vercel.app/api/payments/webhook`)
4. **Secret**: Enter a strong random secret (32+ characters) and set it in Vercel as `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events**:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `payment.refunded`
   - `order.paid`

---

## 2. Webhook Signature Verification Algorithm

Razorpay passes the HMAC-SHA256 signature in the `X-Razorpay-Signature` HTTP header.

$$\text{Signature} = \text{HMAC-SHA256}(\text{Raw Request Body}, \text{RAZORPAY\_WEBHOOK\_SECRET})$$

```typescript
import crypto from 'crypto';

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'hex');

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
```

---

## 3. Idempotency & Deduplication
To prevent duplicate processing when Razorpay retries webhook deliveries:
1. Compute a unique event key: `SHA-256(orderId + "|" + paymentId + "|" + eventType)`.
2. Check `PaymentWebhook` table for existing processed records.
3. If already processed, immediately return `HTTP 200 OK` with `{ received: true, processed: false, reason: "duplicate" }`.
