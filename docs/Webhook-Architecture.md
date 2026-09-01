# Webhook Architecture & Processing Pipeline

## 1. Webhook Pipeline

Razorpay webhooks provide authoritative server-to-server notifications when payment events occur asynchronously (such as UPI approvals or off-session captures).

```
[ Razorpay Gateway ]
         │
         │ HTTPS POST /api/webhooks/razorpay (Headers: X-Razorpay-Signature)
         ▼
[ 1. Rate Limiting Guard ] ──(Exceeded)──► HTTP 429
         │
         ▼
[ 2. Read Raw Text Body ]
         │
         ▼
[ 3. HMAC-SHA256 Constant-Time Verification ] ──(Invalid)──► HTTP 400 + Security Alert
         │
         ▼
[ 4. Zod Schema Parse & Validation ]
         │
         ▼
[ 5. Deduplication Check via SHA-256(order|payment|event) ] ──(Duplicate)──► HTTP 200 (Skip)
         │
         ▼
[ 6. Replay Attack Timestamp Check (5 min window) ] ──(Expired)──► HTTP 200 (Flagged)
         │
         ▼
[ 7. Amount Cross-Verification in Paise ] ──(Mismatch)──► HTTP 200 (Fraud Alert)
         │
         ▼
[ 8. Atomic Database Transaction (prisma.$transaction) ]
         ├── Update Donation Session -> COMPLETED
         ├── Update Donation -> COMPLETED (amountVerified=true)
         ├── Insert PaymentTransaction Record
         ├── Insert Immutable Verifiable Receipt
         ├── Insert Ledger Transaction (INFLOW)
         └── Insert In-App Notification
         │
         ▼
[ 9. Background Asynchronous Actions ]
         ├── Dispatch Socket.IO Real-time update to member room
         ├── Dispatch Firebase Push Notifications
         └── Dispatch Email & SMS Receipt (Resend / Twilio)
         │
         ▼
[ 10. Return HTTP 200 OK to Gateway ]
```

---

## 2. Supported Events

| Event | Action Taken |
|---|---|
| `payment.captured` | Finalizes donation session, generates receipt, writes ledger entry |
| `order.paid` | Confirms full settlement of order |
| `payment.failed` | Transitions donation & session to `FAILED`, notifies user via socket |
| `payment.refunded` | Transitions donation to `REFUNDED`, logs ledger `OUTFLOW` entry |
| `refund.created` | Records refund audit log |

---

## 3. Idempotency & Replay Protection

### Deduplication Key
```typescript
const webhookEventId = crypto
  .createHash('sha256')
  .update(`${orderId}:${paymentId}:${eventType}`)
  .digest('hex');
```

If a record with `webhookEventId` already exists in `prisma.paymentWebhook` with status `PROCESSED`, the handler immediately exits with `{ received: true, processed: false, reason: 'duplicate' }` without double-crediting.
