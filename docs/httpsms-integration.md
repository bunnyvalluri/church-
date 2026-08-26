# Kingdom of Christ Ministries (KCM) — Production httpSMS Delivery Engine

## 1. Executive Summary

This document describes the production integration of **[httpSMS](https://github.com/NdoleStudio/httpsms.git)** into the Kingdom of Christ Ministries (KCM) management platform. 

The integration provides a high-reliability, low-cost SMS delivery infrastructure that relays notifications via an Android phone gateway hosting the church's official SIM card, backed by an authoritative PostgreSQL outbox queue, exponential backoff retries, rate limiting, and real-time Socket.io administrative telemetry.

---

## 2. System Architecture

```
                                  ┌───────────────────────────┐
                                  │   KCM Business Events     │
                                  │ • Event Creation / Update │
                                  │ • Member Registration     │
                                  │ • Verified Donations      │
                                  │ • Pastoral Prayer Desk    │
                                  │ • Admin Announcements     │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Notification Service    │
                                  │ • Preference Filtering    │
                                  │ • Dynamic Templating      │
                                  │ • E.164 (+91) Normalizer  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   PostgreSQL (Authoritative)│
                                  │ • `sms_messages` (QUEUED) │
                                  │ • Unique Idempotency Key  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │    SMS Queue & Worker     │
                                  │ • Token Bucket Limiter    │
                                  │   (Max 30 SMS/minute)     │
                                  │ • Exponential Backoff     │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │  SMS Provider Interface   │
                                  │      (`SMSProvider`)      │
                                  └──────┬─────────────┬──────┘
                                         │             │
                    (SMS_PROVIDER=mock)  │             │ (SMS_PROVIDER=httpsms)
                                         ▼             ▼
                             ┌───────────────┐   ┌────────────────────────────┐
                             │MockSMSProvider│   │      HttpSMSProvider       │
                             │ (Sandbox/Dev) │   │ (POST /v1/messages/send)   │
                             └───────────────┘   └─────────────┬──────────────┘
                                                               │
                                                               ▼
                                                 ┌────────────────────────────┐
                                                 │   httpSMS Cloud Service    │
                                                 └─────────────┬──────────────┘
                                                               │
                                                               ▼
                                                 ┌────────────────────────────┐
                                                 │   KCM Android Gateway      │
                                                 │   (Church Mobile SIM)      │
                                                 └─────────────┬──────────────┘
                                                               │
                                                               ▼
                                                 ┌────────────────────────────┐
                                                 │  Church Member / Recipient │
                                                 └────────────────────────────┘
                                                               │
                                         Delivery Webhook Events
                                                               │
                                                               ▼
                                  ┌───────────────────────────────────────────┐
                                  │ POST /api/webhooks/httpsms                │
                                  │ • Signature Authentication                │
                                  │ • Idempotent State Transition             │
                                  │ • Socket.io Real-time Push to Dashboard   │
                                  └───────────────────────────────────────────┘
```

---

## 3. Environment Variables Configuration

Add the following configuration parameters to your environment files (`.env`, `.env.local`, or server environment):

```env
# ── httpSMS Android Gateway Engine ───────────────────────────────────────────
# Active provider: "httpsms" in production, "mock" in development/testing
SMS_PROVIDER="httpsms"

# API key generated from https://httpsms.com console
HTTPSMS_API_KEY="your_httpsms_api_key_here"

# The phone number associated with the SIM card in the Android gateway phone
HTTPSMS_FROM_NUMBER="+919876543210"

# httpSMS API Endpoint (Default: https://api.httpsms.com/v1)
HTTPSMS_BASE_URL="https://api.httpsms.com/v1"

# Shared secret used to sign and verify incoming delivery webhooks
HTTPSMS_WEBHOOK_SECRET="your_secure_random_webhook_secret"

# Default country code for phone normalization (Default: IN = +91)
SMS_DEFAULT_COUNTRY="IN"

# Maximum automatic retry attempts for transient errors
SMS_MAX_RETRIES="3"

# Rate limit to protect Android SIM from carrier throttling (SMS/minute)
SMS_RATE_LIMIT_PER_MINUTE="30"

# Background worker activation flag
SMS_QUEUE_ENABLED="true"
```

---

## 4. Android Gateway Setup Guide

Follow these steps to configure the physical Android phone running the KCM SIM card:

1. **Install httpSMS App**:
   - Download the official httpSMS app from Google Play Store on the dedicated church Android device.
2. **Account Sign-In & Pairing**:
   - Log in using the same account used on [httpsms.com](https://httpsms.com).
   - In the web dashboard, copy the generated **API Key** into your server `.env` as `HTTPSMS_API_KEY`.
3. **Android Device Optimization**:
   - Navigate to Android **Settings → Battery → Battery Optimization** (or *Unrestricted Background Usage*).
   - Ensure the httpSMS app is set to **Don't Optimize / Unrestricted** so Android does not kill the process during idle periods.
   - Keep the phone connected to a stable Wi-Fi network and a constant power source.

---

## 5. Webhook Setup & Real-time Sync

Configure the webhook callback URL in your httpSMS dashboard:

- **Webhook URL**: `https://your-domain.com/api/webhooks/httpsms`
- **Secret**: Set the same secret in `HTTPSMS_WEBHOOK_SECRET`.
- **Events Subscribed**:
  - `message.sent`
  - `message.delivered`
  - `message.failed`
  - `message.expired`

When a webhook arrives, the backend:
1. Validates the `x-webhook-signature` or `x-api-key` header using HMAC SHA-256.
2. Idempotently updates the `sms_messages` table record matching `provider_message_id`.
3. Broadcasts a real-time event via Companion Socket.io (`sms.delivered`, `sms.failed`, `sms.updated`), instantly updating the admin dashboard without manual browser refresh.

---

## 6. Database Schema (PostgreSQL / Prisma)

### Table: `sms_messages`

| Column | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Primary Key |
| `notification_id` | `String?` | Optional reference to business notification |
| `member_id` | `String?` | Foreign key referencing `members(id)` |
| `phone_number` | `String` | Raw recipient phone number |
| `normalized_phone_number` | `String` | E.164 formatted number (`+91...`) |
| `message` | `Text` | Full message body |
| `provider` | `String` | `"httpsms"` or `"mock"` |
| `provider_message_id` | `String?` | Unique provider message ID from httpSMS |
| `idempotency_key` | `String?` | Unique constraint preventing duplicate sends |
| `status` | `SmsStatus` | `QUEUED`, `PROCESSING`, `SENT`, `DELIVERED`, `FAILED`, `RETRYING`, `EXPIRED`, `CANCELLED` |
| `attempts` | `Int` | Delivery attempt count |
| `max_attempts` | `Int` | Maximum retry limit (default: 3) |
| `scheduled_at` | `DateTime?` | Future scheduled timestamp |
| `sent_at` | `DateTime?` | Dispatched timestamp |
| `delivered_at` | `DateTime?` | Confirmed carrier delivery timestamp |
| `failed_at` | `DateTime?` | Permanent failure timestamp |
| `failure_reason` | `String?` | Error description from provider/carrier |
| `error_code` | `SmsErrorCode?` | Classified error type |
| `metadata` | `Json` | Audit/context metadata |
| `created_at` | `DateTime` | Created timestamp |
| `updated_at` | `DateTime` | Last update timestamp |

---

## 7. Business Workflows & Triggers

### A. Church Events (Create & Update)
When an event is published or modified in `/event-manager` or `/api/events`:
- The event upload loop calls `notificationDispatcher.js`.
- Eligible members opted-in to Event notifications are resolved.
- Unique idempotency key `event-{eventId}-{memberId}-{action}` prevents duplicate sends.
- SMS jobs are placed into the Outbox queue.

### B. Member Registration
Upon successful user account registration in `/api/auth/register`:
- `sendWelcomeSMS(member)` is called after the database transaction is committed.
- Welcomes the member with customized blessing text.

### C. Online Offerings & Donations
When an online payment is verified via Razorpay/Stripe webhook:
- Only after database transaction verification succeeds, `sendDonationSMS(donation)` triggers.
- Generates official receipt reference: `"KCM Ministries: Praise the Lord! Your offering of ₹500 was received successfully. (Ref: KCM-XXXXXX)"`.

### D. Pastoral Prayer Desk
When a member submits a prayer request:
- An acknowledgment SMS confirms pastoral intercession.

---

## 8. Admin Management Console

- **Dashboard**: [`/admin/notifications/sms`](file:///c:/K.C.M-Portal/frontend/app/admin/notifications/sms/page.tsx)
  - Displays KPI counts: Total, Queued, Processing, Sent, Delivered, Retrying, Failed.
  - Live table with real-time Socket.io updates.
  - One-click actions: View Payload Details, Retry Failed Message, Cancel Queued Message.
- **Diagnostic Test Console**: [`/admin/notifications/sms/test`](file:///c:/K.C.M-Portal/frontend/app/admin/notifications/sms/test/page.tsx)
  - Interactive phone number validator (+91).
  - Church message template selector with live preview.
  - GSM-7 vs Unicode (UCS-2) segment calculator.
  - Confirmation safety modal with administrative audit logging.

---

## 9. Security, Privacy & Rate Limiting

1. **Authentication & RBAC**:
   - All administrative SMS endpoints require `SUPER_ADMIN` or `ADMIN` role authentication.
2. **Credential Isolation**:
   - `HTTPSMS_API_KEY` and credentials exist **strictly on the backend**. They are never exposed to React, Next.js client bundles, or public API responses.
3. **Data Minimization & Masking**:
   - Phone numbers are masked in logs and public UI (`+91 98****3210`).
4. **SIM Protection Rate Limiting**:
   - A token-bucket rate limiter paces delivery at max 30 SMS/minute to prevent mobile carrier throttling or SIM blocking.
