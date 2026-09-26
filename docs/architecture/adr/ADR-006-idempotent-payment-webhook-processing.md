# ADR-006: Idempotent Razorpay Webhook Ingestion & Timing-Safe HMAC Verification

## Status
`ACCEPTED`

## Context
Payment gateways (Razorpay) deliver webhook notifications asynchronously with potential retries, out-of-order deliveries, and duplicate transmissions. Financial records must remain 100% accurate without duplicate donation receipts.

## Decision
Implement a hardened payment webhook architecture:
1. **Raw Body Preservation**: The raw request buffer is captured for HMAC SHA256 signature verification.
2. **Timing-Safe Comparison**: `crypto.timingSafeEqual` is used to prevent timing side-channel attacks.
3. **Idempotency Locking**: Unique `razorpay_payment_id` is verified against the database and memory deduplication cache before executing database commits or PDF receipt generation.

## Consequences
- **Positive**: Zero duplicate donation entries, impervious to signature spoofing and replay attacks.
- **Negative**: Requires strict raw body middleware configuration.
