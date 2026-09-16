# KCM Email System Security Specification

## 1. Secrets Management
- **Zero Secrets in Frontend**: Email provider keys (`RESEND_API_KEY`, `SMTP_PASS`, `RESEND_WEBHOOK_SECRET`) are strictly server-side environment variables. No `NEXT_PUBLIC_` prefixes are permitted on email credentials.
- **Credential Redaction in Logs**: Loggers redact API keys, session tokens, passwords, and connection strings.
- **Environment Isolation**: Production, Staging, and Development use independent credential sets controlled by `EMAIL_MODE`.

---

## 2. Webhook Signature Verification & Replay Protection

Resend uses the Svix standard for cryptographic webhook authenticity:
1. **Timestamp Freshness**:
   Every incoming webhook includes a `svix-timestamp` or `webhook-timestamp` header. The endpoint rejects any payload with a timestamp deviation $> 300$ seconds (5 minutes) to eliminate replay attacks.
2. **HMAC-SHA256 Signature**:
   The signature is computed over:
   $$\text{Payload to Sign} = \text{svix-id} + "." + \text{svix-timestamp} + "." + \text{rawBody}$$
   Using the configured secret (`RESEND_WEBHOOK_SECRET`).
3. **Database-Enforced Unique Constraint**:
   The `EmailWebhookEvent` table enforces `@unique` on `provider_event_id`. Duplicate webhook transmissions are recognized and discarded idempotently with HTTP 200 `{ status: "DUPLICATE" }`.

---

## 3. Privacy & Data Minimization

1. **Email Address Hashing**:
   - The primary search key in `EmailEvent` is `recipient_hash` (SHA-256 hex digest).
   - This allows instant correlation of delivery records without storing plain-text user emails in log sinks.
2. **Masked Email Display**:
   - The UI and notification bodies display masked email representations (e.g. `r*************3@gmail.com`).
3. **Template Data Sanitization**:
   - All dynamic parameters (user names, browsers, IP addresses, donation amounts) are escaped using HTML entity encoding before rendering into templates to eliminate Cross-Site Scripting (XSS) and HTML injection.
