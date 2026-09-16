# KCM Email Delivery Pipeline & Lifecycle Guide

## 1. Authentication to Mailbox Delivery Flow

Every transactional email follows a strictly bounded, observable sequence:

### Step 1: Authentication & Session Verification
- The user authenticates via `/api/auth/login`, `/api/auth/google`, or `/api/auth/register`.
- Password verification or OAuth token validation completes successfully.
- An authenticated session is minted with HttpOnly security cookies.

### Step 2: Security Event Persistence
- A `SecurityEvent` record is inserted into Neon PostgreSQL:
  ```typescript
  await prisma.securityEvent.create({
    data: {
      userId: user.id,
      eventType: 'USER_LOGIN_SUCCESS',
      idempotencyKey: deterministicKey,
      ipAddress: clientIp,
      ipHash: sha256(clientIp),
      userAgent: ua.slice(0, 200),
      deviceInfo: isMobile ? 'Mobile Device' : 'Desktop Browser',
      metadata: JSON.stringify({ method: 'Email & Password' }),
    },
  });
  ```

### Step 3: Idempotency & Duplicate Elimination
- A deterministic idempotency key is computed: `SHA-256(recipient + template + uniqueScope)`.
- If a identical event is already registered within the 3-minute sliding window or recorded in PostgreSQL, the request returns immediately without duplicating network traffic.

### Step 4: Bounded Serverless Execution
- In Vercel Serverless Functions, unbounded async tasks risk premature termination when the runtime returns the HTTP response.
- KCM uses bounded execution with `Promise.race([emailPromise, timeoutPromise])` (3500ms ceiling).
- The user receives sub-second login responses while the serverless function guarantees provider dispatch.

### Step 5: Provider Handshake & Multi-Transport Failover
- `EmailService` invokes `CompositeEmailProvider`:
  1. Primary: **Resend Provider** (`resend.emails.send`).
  2. If Resend fails with a transient error (e.g., 429 or 5xx), the system retries with exponential backoff and jitter.
  3. If Resend fails with an outage or configuration error, it immediately fails over to **SMTP Provider** (Gmail App Password or AWS SES relay).
  4. In production, if all transports fail, the error is preserved faithfully and recorded as `FAILED`.

### Step 6: Asynchronous Webhook Confirmation
- For providers supporting delivery webhooks (Resend), a webhook is dispatched upon mailbox receipt (`email.delivered`):
  - Received by `/api/webhooks/resend`.
  - Svix HMAC signature verified.
  - Replay protection checked against `email_webhook_events`.
  - `EmailEvent.status` transitioned from `SENT` to `DELIVERED`.

---

## 2. Retry Policy & Exponential Backoff

Transient errors undergo bounded retries:
- **Base delay**: 800ms
- **Multiplier**: $2^{\text{attempt}}$
- **Jitter**: 50%–100% randomization factor
- **Max Delay**: 10,000ms
- **Formula**:
  $$\text{Delay} = \min(10000, 800 \times 2^{\text{attempt}}) \times \text{Uniform}(0.5, 1.0)$$

Permanent errors (HTTP 400, 401, 403, 422) **never retry** to prevent API quota starvation or provider blacklisting.
