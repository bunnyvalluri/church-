# Payment Gateway & Financial Architecture

## 1. Executive Summary

The Kingdom of Christ Ministries (KCM) platform implements a **zero-trust financial transaction architecture**. All payment logic strictly treats client browsers as untrusted execution environments. The backend (Next.js serverless running on Vercel), PostgreSQL relational database (Neon), and the Razorpay Payment Gateway serve as the authoritative tri-party trust model.

```
+----------------+          1. Create Order          +--------------------------+
|  User Browser  | --------------------------------> |     KCM Backend API      |
|  (Untrusted)   |                                   |  (Next.js Serverless)    |
+----------------+                                   +--------------------------+
       |                                                 |                  |
       | 2. Safe Payload (OrderID, QR, UPI)              | 1a. Validate     | 1b. Create Order
       |<------------------------------------------------+     & Create DB  |     (Paise)
       |                                                       Session      v
       |                                                            +----------------+
       | 3. Checkout / Dynamic UPI                                  | Razorpay Gate- |
       +----------------------------------------------------------->| way (Authority)|
       |                                                            +----------------+
       | 4. Payment Completed Callback (Client-side)                        |
       v                                                                    |
+----------------+          5. Signature Verification Request               | 6. Authoritative
| KCM Verify API | <--------------------------------------------------------+    HMAC Webhook
+----------------+                                                          |    (Server-to-Server)
       |                                                                    v
       | 5a. Constant-time HMAC Verification                         +----------------+
       | 5b. Atomic DB Transaction ($transaction)                   |  KCM Webhook   |
       +-----------------------------------------------------------> |    Endpoint    |
                                                                     +----------------+
                                                                            |
                                                                            | 7. Atomic Settle
                                                                            v
                                                                     +----------------+
                                                                     | PostgreSQL DB  |
                                                                     | Ledger/Receipt |
                                                                     +----------------+
```

---

## 2. Core Architecture Principles

### Zero-Trust Client Layer
- The browser **NEVER** decides or declares payment success.
- Amounts, purpose codes, currencies, and donor identities submitted from the client are validated against database allowlists.
- All monetary amounts are computed and stored in **integer minor units (paise)** to eliminate floating-point precision hazards.

### Pluggable Payment Provider Abstraction
- The platform defines a unified `PaymentProvider` interface in `lib/payments/types.ts`:
  - `createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>`
  - `verifyPaymentSignature(input: VerifySignatureInput): boolean`
  - `verifyWebhookSignature(rawBody: string, signature: string | null): boolean`
  - `fetchPayment(paymentId: string): Promise<GatewayPaymentDetails | null>`
  - `processRefund(input: ProcessRefundInput): Promise<RefundResult>`
- `RazorpayPaymentProvider` implements this contract, isolating gateway-specific APIs from business domains.

### Financial Single Source of Truth
- Relational PostgreSQL (`prisma.donation`, `prisma.donationSession`, `prisma.paymentTransaction`, `prisma.receipt`, `prisma.transaction`) acts as the immutable financial ledger.
- Status changes and receipt generation execute within atomic transactions (`prisma.$transaction`).

---

## 3. Payment State Machine

```
   [ CREATED ]
        │
        ▼
   [ PENDING ] ── (Timeout/Expiry) ──► [ EXPIRED ]
        │
        ├── (Gateway Auth) ──► [ AUTHORIZED ]
        │                             │
        ├── (Capture / Webhook) ──────┴──► [ CAPTURED / COMPLETED ]
        │                                           │
        ├── (Failure / Drop)                        ├── (Admin Refund) ──► [ REFUNDED ]
        │                                           └── (Partial)       ──► [ PARTIALLY_REFUNDED ]
        ▼
   [ FAILED ]
```

| State | Description | Permitted Next States |
|---|---|---|
| `CREATED` | Session and order created on backend | `PENDING`, `CANCELLED`, `EXPIRED` |
| `PENDING` | Awaiting donor payment or bank confirmation | `AUTHORIZED`, `CAPTURED`, `FAILED`, `EXPIRED`, `CANCELLED` |
| `AUTHORIZED` | Payment authorized on gateway | `CAPTURED`, `FAILED`, `CANCELLED` |
| `CAPTURED` | Payment captured and verified | `REFUNDED`, `PARTIALLY_REFUNDED` |
| `FAILED` | Payment failed or rejected by bank | `CAPTURED` (Only via verified gateway reconciliation) |
| `REFUNDED` | Full refund processed and audited | *(Terminal)* |
| `EXPIRED` | Payment window timed out (>15 mins) | *(Terminal)* |

---

## 4. Endpoints & Directory Structure

```
frontend/
├── lib/
│   ├── payments/
│   │   ├── index.ts              # Provider factory & registry
│   │   ├── types.ts              # Domain types, interfaces, state machine
│   │   ├── razorpayProvider.ts   # Concrete Razorpay gateway implementation
│   │   └── stateMachine.ts       # State transition rules engine
│   ├── paymentService.ts         # Atomic transactional donation completion
│   ├── paymentSecurity.ts        # Rate limiting, auto-block, audit logging
│   └── security.ts               # Cryptographic verification & HMAC functions
├── app/
│   └── api/
│       ├── payments/
│       │   ├── create-order/     # POST: Safe order creation
│       │   ├── verify/           # POST: Cryptographic signature verification
│       │   ├── status/[id]/      # GET: Authoritative status polling (IDOR-safe)
│       │   └── webhook/          # POST: Razorpay webhook processor
│       ├── webhooks/
│       │   └── razorpay/         # POST: Canonical Razorpay webhook endpoint
│       └── admin/
│           └── finance/
│               ├── route.ts      # GET/POST: Ledgers and transactions
│               └── reconcile/    # GET/POST: Discrepancy scanner & reconciliation
```
