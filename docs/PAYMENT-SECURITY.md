# Payment Security & Fraud Prevention Guide

## 1. Security Architecture Matrix

| Layer | Threat Model | Mitigation Technique |
| :--- | :--- | :--- |
| **Transport** | Man-in-the-Middle, packet interception | Strict HTTPS / TLS 1.3, HSTS headers. |
| **Client API** | Parameter tampering, script injection | Strict Zod validation schemas (`strip` / `strict`). |
| **Business Logic** | Amount tampering (paying ₹1 instead of ₹5000) | Server converts INR to integer paise, verifies order amount via Razorpay API before settling. |
| **Authentication** | Broken access control, IDOR | Multi-role RBAC, session ownership validation, timing-safe crypto token comparison. |
| **Webhook Channel** | Fake webhook replay attacks | Raw text HMAC-SHA256 signature verification, 5-min timestamp window, unique SHA-256 event ID deduplication. |
| **Rate Limiting** | Gateway abuse, brute-force card testing | IP-based token bucket rate limiter, progressive cooldown, automated IP blocking upon repeated failures. |
| **Compliance** | 80G Tax Compliance | Mandatory PAN format validation (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) for tax exemption receipts. |

---

## 2. Timing-Safe Cryptographic Verification
To protect against timing side-channel attacks, all cryptographic comparisons use `crypto.timingSafeEqual`:

```typescript
export function timingSafeCompare(aHex: string, bHex: string): boolean {
  try {
    const a = Buffer.from(aHex, 'hex');
    const b = Buffer.from(bHex, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
```

---

## 3. Rate Limiting Configuration

```typescript
export const RATE_LIMITS = {
  CREATE_ORDER: { windowMs: 10 * 60 * 1000, maxRequests: 20 },
  VERIFY_PAYMENT: { windowMs: 1 * 60 * 1000, maxRequests: 60 },
  WEBHOOK: { windowMs: 1 * 60 * 1000, maxRequests: 120 },
  RECEIPT: { windowMs: 5 * 60 * 1000, maxRequests: 30 },
};
```

---

## 4. Audit Logging & SIEM Integration
Every payment event is recorded in the PostgreSQL `AuditLog` and MongoDB event store:
- `PAYMENT_ORDER_CREATED`
- `PAYMENT_VERIFIED`
- `PAYMENT_FAILED`
- `PAYMENT_SIGNATURE_INVALID`
- `WEBHOOK_PROCESSED`
- `WEBHOOK_DUPLICATE_SKIPPED`
- `ADMIN_REFUND_EXECUTED`
- `SECURITY_IP_BLOCKED`

Sensitive identifiers (e.g. Credit Card numbers, bank accounts, secret keys) are masked before persisting:
```typescript
maskSensitive("pay_1234567890abcdef", 8) // => "pay_1234...cdef"
```
