# Payment Testing & Quality Assurance Guide

## 1. Test Suite Overview

Payment testing encompasses unit, integration, and security test vectors to guarantee zero financial vulnerabilities prior to live deployment.

```
frontend/tests/payments/
└── razorpay-payments.spec.ts
```

---

## 2. Test Cases Covered

### A. Order Creation Tests
1. **Valid Order Creation**: Verifies HTTP 200, return of `orderId`, `amount`, `currency`, `upiUri`, `qrCode`, and absence of private secrets in response.
2. **Negative / Zero Amount**: Rejects non-positive donation amounts with HTTP 400.
3. **Excessive Amount (> Max Bound)**: Rejects amounts exceeding church settings max with HTTP 400.
4. **Invalid Content-Type**: Rejects non-JSON bodies with HTTP 415/400.

### B. Signature Verification Tests
1. **Valid HMAC Signature**: Confirms authentic `HMAC-SHA256(order_id|payment_id, secret)` verifies successfully.
2. **Forged Signature**: Rejects fabricated/manipulated signatures with HTTP 400.
3. **Empty / Null Signature**: Fails validation with HTTP 400.

### C. Webhook Handler Tests
1. **Unsigned Webhook**: Rejects webhook requests without `X-Razorpay-Signature`.
2. **Valid Webhook Capture**: Verifies `payment.captured` event settlement, database record update, and receipt generation.
3. **Duplicate Webhook Idempotency**: Second identical event returns `{ duplicate: true }` without duplicate credit or double transaction creation.
4. **Replay Timestamp Expiration**: Events older than 5 minutes are rejected.

---

## 3. Running Automated Tests

```bash
# Run payment integration test suite
npm run test -- tests/payments/razorpay-payments.spec.ts -w frontend

# Run typecheck
npm run typecheck -w frontend
```
