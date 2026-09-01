# Kingdom of Christ Ministries (KCM) — Payment Architecture

## 1. Executive Summary
The KCM Payment & Giving system is an enterprise-grade, Zero-Trust financial infrastructure designed for high availability, security, real-time feedback, and strict financial auditability.

### Core Payment Principles
1. **Zero Client-Side Trust**: The browser never declares payment success or generates verified transaction IDs.
2. **Server-Side Order Generation**: Razorpay Orders API is invoked securely on the backend; amounts are converted to integer paise (`₹100 = 10000 paise`) to eliminate floating-point calculation anomalies.
3. **Cryptographic HMAC-SHA256 Verification**:
   - Client checkout response signatures are verified server-side: `HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)`.
   - Webhook events are verified against the raw request body: `HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET)`.
4. **Idempotency & Replay Protection**:
   - Webhook deduplication through SHA-256 hash digests (`orderId|paymentId|eventType`).
   - Timestamp validation rejecting replays older than 5 minutes.
5. **Multi-Channel Settlement**:
   - Dynamic UPI QR Generation (Instant scan via BHIM, GPay, PhonePe, Paytm).
   - Razorpay Standard Checkout SDK (Cards, NetBanking, UPI Modal, Wallets).
   - Real-time Socket.IO and short polling synchronization.

---

## 2. Payment API Endpoints

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/payments/create-order` | `POST` | Public | Generates server-side Razorpay Order, creates DB session & dynamic UPI QR. |
| `/api/donations/create-order`| `POST` | Public | Companion order creation endpoint for NGO giving wizard. |
| `/api/payments/verify` | `POST` | Public | HMAC-SHA256 signature verification & amount cross-check. |
| `/api/donations/verify` | `POST` | Public | Verification endpoint for NGO flow. |
| `/api/webhooks/razorpay` | `POST` | Gateway | Primary authoritative webhook handler with raw body HMAC verification. |
| `/api/payments/webhook` | `POST` | Gateway | Unified webhook route handler. |
| `/api/payments/[id]/status` | `GET` | Authenticated/Owner | Safe status polling query endpoint. |
| `/api/donations/status/[sessionId]` | `GET` | Public/Owner | Real-time session status query endpoint. |
| `/api/receipts/[id]` | `GET` | Public/Owner | Retrieves verified tax receipt metadata. |
| `/api/receipts/[id]/pdf` | `GET` | Public/Owner | Generates printable 80G tax receipt PDF/HTML. |
| `/api/admin/payments/refund` | `POST` | Admin/Finance | Initiates official Razorpay payment refund and updates ledger. |

---

## 3. Supported Currencies & Gateways
- **Default Currency**: INR (`₹`)
- **Primary Gateway**: Razorpay (India & International Cards via Razorpay)
- **Secondary/Optional**: Stripe (USD)

---

## 4. Financial Reconciliation & Ledger
Each completed donation atomically generates:
1. `Donation` record marked `COMPLETED` with `amountVerified: true` and `signatureVerified: true`.
2. `DonationSession` marked `COMPLETED`.
3. `PaymentTransaction` record linking to church bank ledger.
4. `Receipt` record with unique serial number, verification code, and 80G tax exemption details.
5. `AuditLog` entry detailing source IP, timestamp, and gateway reference.
