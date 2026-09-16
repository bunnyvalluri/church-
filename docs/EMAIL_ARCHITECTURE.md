# KCM Email System Architecture

## 1. Overview
The Kingdom of Christ Ministries (KCM) transactional email system provides secure, resilient, and observable email delivery across authentication, administrative notifications, pastoral care, and member operations for the production portal at [https://kcmchurch.vercel.app](https://kcmchurch.vercel.app).

---

## 2. High-Level Architecture Diagram

```
                     ┌────────────────────────────────────────────────────────┐
                     │               Client / Web Application                 │
                     │    POST /api/auth/login, /api/auth/google, /register   │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │                Next.js Route Handlers                  │
                     │          (Serverless Functions on Vercel)              │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                       ┌─────────────────────────┴─────────────────────────┐
                       ▼                                                   ▼
       ┌───────────────────────────────┐                   ┌───────────────────────────────┐
       │   1. SecurityEvent Record     │                   │  2. Deterministic Idempotency │
       │   - Immutable security audit  │                   │  - SHA-256(email:tpl:scope)   │
       │   - Hashed IP & UserAgent     │                   │  - In-memory sliding cache    │
       │   - Stored in Neon PostgreSQL │                   │  - DB unique constraint check │
       └───────────────────────────────┘                   └───────────────┬───────────────┘
                                                                           │
                                                                           ▼
                                                           ┌───────────────────────────────┐
                                                           │   3. EmailEvent Initialized   │
                                                           │   - Status: SENDING / PENDING │
                                                           │   - Masked recipient          │
                                                           │   - Neon DB Record Created    │
                                                           └───────────────┬───────────────┘
                                                                           │
                                                                           ▼
                                                           ┌───────────────────────────────┐
                                                           │  4. Composite Provider Engine │
                                                           │  Bounded Promise Execution    │
                                                           └───────────────┬───────────────┘
                                                                           │
                                           ┌───────────────────────────────┴───────────────────────────────┐
                                           ▼                                                               ▼
                           ┌───────────────────────────────┐                               ┌───────────────────────────────┐
                           │   Primary: Resend Provider    │                               │   Fallback: SMTP Provider     │
                           │   - Direct API Dispatch       │                               │   - NodeMailer Pool           │
                           │   - Domain Verification Guard │                               │   - Custom / Gmail SMTP       │
                           └───────────────┬───────────────┘                               └───────────────┬───────────────┘
                                           │                                                               │
                                           └───────────────────────────────┬───────────────────────────────┘
                                                                           │
                                                   ┌───────────────────────┴───────────────────────┐
                                                   ▼                                               ▼
                                      ┌───────────────────────────────┐               ┌───────────────────────────────┐
                                      │       Provider Success        │               │       Provider Failure        │
                                      │ - Status: SENT                │               │ - Classify: Perm vs Transient │
                                      │ - providerMessageId saved     │               │ - Exp Backoff & Jitter Retry  │
                                      │ - Dual-write NotificationLog  │               │ - Status: FAILED / RETRYING   │
                                      └───────────────┬───────────────┘               └───────────────┬───────────────┘
                                                      │                                               │
                                                      ▼                                               ▼
                                      ┌───────────────────────────────┐               ┌───────────────────────────────┐
                                      │    Resend Webhook Handler     │               │ KCM Email Reliability Agent   │
                                      │    POST /api/webhooks/resend  │               │ - Incident Deduplication      │
                                      │ - Svix HMAC Verification      │               │ - Outage Spike Detection      │
                                      │ - Status: DELIVERED / BOUNCED │               │ - Alerts to Administrator     │
                                      └───────────────────────────────┘               │   Vallurirahul3@gmail.com     │
                                                                                      └───────────────────────────────┘
```

---

## 3. Delivery States Lifecycle

The delivery system strictly avoids binary boolean flags (`emailSent = true`). Instead, it models delivery through an explicit finite state machine:

| State | Description | Next Permitted States |
| :--- | :--- | :--- |
| `PENDING` | Created and waiting in queue for dispatch worker or batch window. | `SENDING`, `CANCELLED` |
| `QUEUED` | Placed in bounded serverless memory/background queue. | `SENDING`, `CANCELLED` |
| `SENDING` | Active HTTP or SMTP connection opened to provider. | `SENT`, `FAILED`, `RETRYING` |
| `SENT` | Successfully accepted by provider with confirmed `providerMessageId`. | `DELIVERED`, `BOUNCED` |
| `DELIVERED` | Confirmed delivered to recipient mailbox via provider webhook. | Final state |
| `BOUNCED` | Mailbox hard/soft bounce reported by provider webhook. | Final state |
| `FAILED` | Permanent rejection or retries exhausted. | `RETRYING` (via admin manual intervention) |
| `RETRYING` | Transient failure encountered (429, 5xx, timeout); waiting for exponential backoff. | `SENDING`, `FAILED` |
| `CANCELLED` | Send revoked or invalidated before transmission. | Final state |

---

## 4. Multi-Transport Provider Strategy

1. **Production Mode (`EMAIL_MODE=production`)**:
   - Primary: **Resend** (verified sender domain required).
   - Secondary: **SMTP** (Gmail App Password or AWS SES relay).
   - Mocking is **strictly prohibited** in production. If both Resend and SMTP fail, the operation returns a truthful error code (`UNVERIFIED_DOMAIN`, `INVALID_CREDENTIALS`, etc.), and the event is recorded as `FAILED` to trigger administrator alerting.
2. **Staging Mode (`EMAIL_MODE=staging`)**:
   - Validates integration with live staging credentials without leaking test notifications to production users.
3. **Development Mode (`EMAIL_MODE=development`)**:
   - Safe local testing with in-memory `MockProvider` or sandbox redirection to developer mailbox.

---

## 5. Database Schema (Neon PostgreSQL)

### `security_events`
- `id`: CUID
- `user_id`: Nullable relation to User
- `event_type`: Enum (`USER_REGISTERED`, `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED_THRESHOLD`, etc.)
- `idempotency_key`: `@unique` SHA-256 string
- `ip_address`, `ip_hash`, `user_agent`, `device_info`
- `metadata`: JSON payload

### `email_events`
- `id`: CUID
- `security_event_id`: Relation to `SecurityEvent`
- `recipient_hash`: SHA-256 of recipient email (preserves auditability with zero plain-text leaks)
- `recipient_masked`: Privacy-safe representation (e.g. `r***l@gmail.com`)
- `status`: Enum (`PENDING`, `SENDING`, `SENT`, `DELIVERED`, `BOUNCED`, `FAILED`, `RETRYING`)
- `idempotency_key`: `@unique` SHA-256 string
- `provider`: String (`resend`, `smtp`, `mock`)
- `provider_message_id`: Provider reference ID
- `attempt_count`: Number of transmission attempts
- `last_error_code`: Machine-readable error categorization

### `email_delivery_attempts`
- `id`: CUID
- `email_event_id`: Relation to `EmailEvent`
- `attempt_number`: 1, 2, 3...
- `status`: `SUCCESS` | `FAILED`
- `http_status`: e.g. 200, 403, 429, 503
- `duration_ms`: Latency of provider HTTP/SMTP handshake

### `email_webhook_events`
- `id`: CUID
- `provider_event_id`: `@unique` Svix/Resend event ID for replay protection
- `signature_verified`: Boolean confirmed via HMAC-SHA256
