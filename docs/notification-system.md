# KCM Ministries — Event Notification System Documentation

## Architecture Overview

```
Event Manager → POST /api/events (Next.js or Backend)
                        ↓
              eventUploadLoop.js
              ┌─────────────────────────────────────────────┐
              │ 1. Upload image → Cloudinary                │
              │ 2. Save event → PostgreSQL (Prisma)         │
              │ 3. Emit event:new → Socket.io (real-time)   │
              │ 4. Trigger Next.js cache revalidation        │
              │ 5. Call notificationDispatcher (async)       │
              └─────────────────────────────────────────────┘
                        ↓
            notificationDispatcher.js
            ┌────────────────────────────────────────────────────────┐
            │ • Fetch members ← Google Sheets API v4                 │
            │ • Fan-out parallel dispatch:                            │
            │   ├── Email     → emailService.js    (Resend)          │
            │   ├── SMS       → smsService.js      (Twilio)          │
            │   ├── WhatsApp  → whatsappService.js (Twilio WA)       │
            │   └── Push      → fcmService.js      (Firebase FCM)    │
            │ • HTTP POST → Google Apps Script Webhook (GmailApp)    │
            │ • Log all results → notification_logs table            │
            │ • Create retry jobs → event_notification_retry_jobs    │
            └────────────────────────────────────────────────────────┘
                        ↓
            notificationRetryWorker.js (Every 15 min)
            ┌─────────────────────────────────────────────┐
            │ • Query pending retry jobs                  │
            │ • Retry with exponential backoff            │
            │ • Dead-letter after 3 failed attempts       │
            └─────────────────────────────────────────────┘
```

---

## File Structure

```
backend/
  server.js                          ← New API routes added
  src/
    services/
      sheetsService.js               ← Google Sheets API reader
      emailService.js                ← Resend email sender
      smsService.js                  ← Twilio SMS sender
      whatsappService.js             ← Twilio WhatsApp sender
      fcmService.js                  ← Firebase FCM push sender
      notificationDispatcher.js      ← Master orchestrator
    middleware/
      webhookVerify.js               ← Webhook secret validation
      rateLimiter.js                 ← express-rate-limit config
    cron/
      scheduler.js                   ← Modified: added retry cron
      notificationRetryWorker.js     ← NEW: retry worker
    loops/
      eventUploadLoop.js             ← Modified: calls dispatcher
      notificationLoop.js            ← Modified: all 5 channels

frontend/
  hooks/
    useEventSocket.ts                ← Socket.io + SWR real-time hook

database/
  schema.prisma                      ← Added 2 new models

scripts/
  google/
    NotificationWebhook.gs           ← Google Apps Script
    README.md                        ← Deployment guide
```

---

## API Endpoints (Backend — port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/events` | Create event + trigger all notifications |
| `POST` | `/api/google-event-trigger` | Receive Google Apps Script webhook |
| `POST` | `/api/notifications/dispatch` | Manually re-dispatch for an event |
| `POST` | `/api/notifications/retry` | Manually trigger retry worker |
| `POST` | `/api/device-tokens` | Register FCM device token |
| `GET`  | `/api/loops/health` | Master health diagnostic |

---

## Environment Variables Required

### Google Sheets
```env
GOOGLE_SHEETS_ID=1R7F0c6uL-L1TnYGAwjhVN3RaRjoDjZP8j1J7AlC1...
GOOGLE_SHEETS_RANGE=KCM Members Database!A:M
GOOGLE_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
GOOGLE_WEBHOOK_SECRET=your_shared_secret
GOOGLE_SERVICE_ACCOUNT_KEY=base64_encoded_service_account_json
```

### Twilio
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Firebase
```env
FIREBASE_ADMIN_SERVICE_ACCOUNT=base64_encoded_firebase_service_account
FIREBASE_FCM_TOPIC=kcm-events
```

### Resend (Email)
```env
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=KCM Ministries <noreply@kcmministries.org>
```

---

## Database Tables

### New Tables

| Table | Purpose |
|-------|---------|
| `event_notification_retry_jobs` | Retry queue for failed Email/SMS/WhatsApp sends |
| `google_sheets_members` | Cache/audit of Google Sheets member data |

### Existing Tables Used

| Table | Usage |
|-------|-------|
| `notification_logs` | Every delivery attempt logged here |
| `device_tokens` | FCM push notification tokens |
| `event_notifications` | Summary of channels used per event |
| `audit_logs` | Dispatch summary audit trail |

---

## Google Sheets Schema (KCM Members Database)

| Column | Field | Type |
|--------|-------|------|
| A | timestamp | DateTime |
| B | full_name | Text |
| C | mobile | Phone (E.164) |
| D | whatsapp | Phone (E.164) |
| E | email | Email |
| F | family_name | Text |
| G | family_members | Number |
| H | branch | Text |
| I | notification_preferences | CSV: "Email,SMS,WhatsApp,Push" |
| J | ministry_interest | Text |
| K | prayer_request | Text |
| L | address | Text |
| M | consent | Text: "Yes, I agree" |

---

## Notification Channel Behavior

| Channel | Library | Filter Logic |
|---------|---------|-------------|
| Email | Resend (backend) + GmailApp (Apps Script) | Members with `email` + consent |
| SMS | Twilio | Members with `mobile` + "SMS" preference |
| WhatsApp | Twilio WhatsApp | Members with `whatsapp` or `mobile` + "WhatsApp" preference |
| Push | Firebase FCM | All registered `device_tokens` in PostgreSQL |

### Preference Filtering
- If a member has **no preference** set → they receive **all channels**
- If a member sets `"Email,SMS"` → they receive only Email and SMS

---

## Retry System

Failed notifications are stored in `event_notification_retry_jobs` and automatically retried:

```
Attempt 1 → Fail → Wait 5s  → Attempt 2
Attempt 2 → Fail → Wait 10s → Attempt 3
Attempt 3 → Fail → DEAD_LETTER → AuditLog entry
```

Retry worker runs every **15 minutes** automatically.

Manual trigger:
```bash
curl -X POST http://localhost:3001/api/notifications/retry
```

---

## Deployment Checklist

1. **Google Apps Script**
   - [ ] Paste `NotificationWebhook.gs` into Apps Script
   - [ ] Set `KCM_WEBHOOK_SECRET`, `SHEET_ID`, `BACKEND_URL` in Script Properties
   - [ ] Deploy as Web App (Execute as: Me, Access: Anyone)
   - [ ] Copy Web App URL → `GOOGLE_SCRIPT_WEBHOOK_URL` in .env

2. **Backend**
   - [ ] Run `npm install` in `/backend`
   - [ ] Add all new env vars to `.env.local`
   - [ ] Run `npx prisma migrate dev --name add-notification-retry` in `/database`
   - [ ] Restart backend server

3. **Firebase FCM**
   - [ ] Download service account JSON from Firebase Console
   - [ ] Base64 encode → `FIREBASE_ADMIN_SERVICE_ACCOUNT`
   - [ ] Add `firebase-admin` client to frontend PWA for token registration

4. **Twilio**
   - [ ] Verify Twilio account and fund balance
   - [ ] For WhatsApp: join sandbox OR get Business number approved
   - [ ] Test with personal number before going live

5. **Resend**
   - [ ] Sign up at resend.com
   - [ ] Verify domain `kcmministries.org`
   - [ ] Get API key → `RESEND_API_KEY`

---

## Testing

### Full end-to-end test:
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sunday Worship Service",
    "description": "Join us for our weekly worship service",
    "date": "2026-08-10T06:00:00Z",
    "location": "Main Sanctuary",
    "category": "Worship",
    "branchId": null
  }'
```

### Check notification logs:
```sql
SELECT channel, status, recipient_addr, sent_at, error_message
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 20;
```

### Check retry jobs:
```sql
SELECT channel, status, attempts, next_retry_at, last_error
FROM event_notification_retry_jobs
ORDER BY created_at DESC;
```
