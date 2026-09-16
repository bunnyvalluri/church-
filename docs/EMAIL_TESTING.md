# KCM Email Testing & Verification Guide

## 1. Automated Test Execution

Run the complete test suite:
```bash
# Run all email unit, integration, and security tests
npm run test:email

# Typecheck and validate TypeScript compilation
npm run typecheck

# Verify database schema integrity
npx prisma validate
```

---

## 2. Test Suites Overview

### `frontend/tests/email-system.spec.ts` (55 tests)
- Verifies that production templates contain zero dev/sandbox notices.
- Validates that email subjects contain no `[Sandbox Preview...]` prefixes.
- Tests HTML output for raw CSS leaking regressions.
- Enforces HTML entity escaping for XSS & injection vectors.
- Asserts that plain-text fallbacks exist for all 20 transactional templates (A through T).
- Tests memory sliding window idempotency.

### `frontend/tests/email-delivery-agent.spec.ts` (35 tests)
- Verifies error classification: permanent (`UNVERIFIED_DOMAIN`, `INVALID_CREDENTIALS`, `INVALID_RECIPIENT`) vs transient (`RATE_LIMIT_EXCEEDED`, `NETWORK_TIMEOUT`, `PROVIDER_5XX`).
- Tests exponential backoff calculation and jitter bounds.
- Validates SHA-256 recipient hashing and privacy-safe masking.
- Tests deterministic idempotency key computation across case variances.
- Validates Svix / Resend HMAC-SHA256 signature verification and 5-minute replay window rejection.
- Assesses Email Reliability Agent diagnostic reporting.
- Verifies Composite Provider failover logic.

---

## 3. Manual Live Verification

### Endpoint 1: Health Diagnostic
```bash
# Public ping
curl -i https://kcmchurch.vercel.app/api/health/email

# Authorized internal diagnostic (with admin bearer token or session cookie)
curl -i -H "x-health-key: <SESSION_SECRET>" https://kcmchurch.vercel.app/api/health/email
```

### Endpoint 2: Simulated Webhook Delivery
```bash
curl -X POST https://kcmchurch.vercel.app/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_test_live" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,<computed_signature>" \
  -d '{"type":"email.delivered","data":{"email_id":"mock_test_id"}}'
```
