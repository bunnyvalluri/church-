# Payment Security & Fraud Prevention Guide

## 1. Zero-Trust Security Posture

In the Kingdom of Christ Ministries platform, **all data originating from the client browser is treated as untrusted**. The system defends against common payment fraud vectors and injection attacks.

---

## 2. Threat Models & Mitigation Controls

### 2.1 Amount Tampering Attack
- **Threat**: Attacker changes ₹1,000 to ₹1 or ₹100,000 in browser state or request body before checkout.
- **Mitigation**:
  - Backend calculates and verifies order amount against church database limits.
  - Razorpay order is created on server with amount in integer paise (e.g. ₹1,000 = 100,000 paise).
  - During checkout verification and webhook receipt, the backend fetches payment details from Razorpay or verifies payload `amount` strictly equals `Math.round(session.amount * 100)`. Mismatches trigger immediate rejection, auto-block, and security audit alerts.

### 2.2 Payment Signature Forgery
- **Threat**: Attacker sends fake `razorpay_signature` or `paymentSuccess: true` to mark a donation paid.
- **Mitigation**:
  - `POST /api/payments/verify` requires `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
  - Computes `HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)` on server.
  - Uses `crypto.timingSafeEqual` to prevent timing attacks.
  - Fake signatures immediately return HTTP 400 and record `PAYMENT_SIGNATURE_INVALID`.

### 2.3 Webhook Replay & Duplicate Processing
- **Threat**: Attacker captures legitimate webhook payload and replays it repeatedly to manipulate receipts or balances.
- **Mitigation**:
  - Webhook signature is validated over raw binary/string request body with `RAZORPAY_WEBHOOK_SECRET`.
  - Every event is assigned a deduplication key `SHA-256(order_id | payment_id | event_type)`.
  - Database checks if `webhookEventId` was already processed; duplicate events return HTTP 200 with `{ duplicate: true }` and exit without reprocessing.
  - Replay timestamp protection: events older than 5 minutes in production are rejected.

### 2.4 Insecure Direct Object References (IDOR)
- **Threat**: User queries `/api/payments/status/[id]` to inspect other members' donation history.
- **Mitigation**:
  - Endpoint resolves caller's server session.
  - If donation is tied to a `memberId`, only the owner or an authorized administrator (`ADMIN`, `SUPER_ADMIN`, `FINANCE_ADMIN`, `PASTOR`) is allowed to query the record.
  - Sensitive internal database fields (PII, gateway secrets) are never returned.

---

## 3. Rate Limiting & Auto-Block Policies

| Route | Window | Limit | Action on Breach |
|---|---|---|---|
| `/api/payments/create-order` | 10 minutes | 60 requests / IP | HTTP 429 + Rate Limit Headers |
| `/api/payments/verify` | 15 minutes | 60 requests / IP | HTTP 429 + IP Auto-block after 10 failures |
| `/api/webhooks/razorpay` | 1 minute | 120 requests / IP | HTTP 429 + DDoS protection |
| `/api/receipts/[id]/pdf` | 1 minute | 60 requests / IP | HTTP 429 |

---

## 4. Security Audit Logging

All security-relevant financial events are logged via `writeAuditLog` to the `audit_logs` table:
- `PAYMENT_ORDER_CREATED`
- `PAYMENT_VERIFIED`
- `PAYMENT_SIGNATURE_INVALID`
- `PAYMENT_AMOUNT_MISMATCH`
- `WEBHOOK_RECEIVED`
- `WEBHOOK_DUPLICATE_SKIPPED`
- `WEBHOOK_REPLAY_PREVENTED`
- `ADMIN_FINANCIAL_RECONCILIATION`

**Sensitive Data Masking**: All PII, IP addresses, and gateway tokens logged are masked (e.g. `order_mock_****14`, IP `192.168.***`). API secrets, passwords, UPI PINs, and card CVVs are NEVER logged.
