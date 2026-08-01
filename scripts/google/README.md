# Google Apps Script — KCM Ministries Notification Webhook

## Overview

This Apps Script acts as the **Google Workspace integration layer** for the KCM Ministries event notification system. It:

1. Receives event data from the Node.js backend via an HTTP POST webhook
2. Reads all registered members from the **KCM Members Database** Google Sheet
3. Sends branded Gmail emails to members who opted for Email notifications (using `GmailApp` — **free, no API key needed**)

---

## Step-by-Step Deployment

### Step 1 — Open Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"+ New Project"**
3. Rename the project to: `KCM Notification Webhook`

### Step 2 — Paste the Script

1. Delete the default `function myFunction() {}` code
2. Copy the entire contents of `NotificationWebhook.gs`
3. Paste into the editor
4. Press **Ctrl + S** (or Cmd + S on Mac) to save

### Step 3 — Set Script Properties

1. Click **⚙️ Project Settings** (gear icon) in the left sidebar
2. Scroll to **Script Properties** section
3. Click **"Add script property"** and add these three:

| Property Name | Value |
|---|---|
| `KCM_WEBHOOK_SECRET` | Your secret (same as `GOOGLE_WEBHOOK_SECRET` in .env) |
| `SHEET_ID` | Your Google Sheet ID (from the URL: `...spreadsheets/d/THIS_PART/edit`) |
| `BACKEND_URL` | `https://api.kcmministries.org` (or your backend URL) |

### Step 4 — Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon next to **"Select type"** → choose **"Web app"**
3. Configure:
   - **Description**: `KCM Event Notification Webhook v1`
   - **Execute as**: `Me` (uses your Google account / Gmail quota)
   - **Who has access**: `Anyone` (backend will verify the secret)
4. Click **"Deploy"**
5. **Authorize** the permissions when prompted (Gmail + Sheets access)
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

### Step 5 — Add URL to Backend .env

Add the copied URL to your `.env.local`:
```bash
GOOGLE_SCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

---

## Testing the Webhook

### Test via curl:
```bash
curl -X POST "YOUR_SCRIPT_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_WEBHOOK_SECRET",
    "event_title": "Test Event",
    "event_branch": "Shapur Nagar",
    "event_date": "2026-08-15T10:00:00Z",
    "event_description": "A test event notification.",
    "event_link": "https://kcmministries.org/events"
  }'
```

### Expected response:
```json
{
  "success": true,
  "members_loaded": 42,
  "emails_sent": 35,
  "emails_failed": 0
}
```

### View execution logs:
1. In Apps Script editor, click **"Executions"** in the left sidebar
2. Click any execution to see the logs

---

## Gmail Quota

| Account Type | Daily Email Limit |
|---|---|
| Personal Gmail | 100 emails/day |
| Google Workspace | 1,500 emails/day |

> For large congregations (500+ members), consider using **Resend** (backend email service) instead of GmailApp, or upgrade to Google Workspace.

---

## Architecture Diagram

```
Event Manager publishes event
         ↓
  Node.js Backend (POST /api/events)
         ↓
  eventUploadLoop.js saves to DB
         ↓
  notificationDispatcher.js
    ├── HTTP POST → GOOGLE_SCRIPT_WEBHOOK_URL  ← THIS SCRIPT
    │         ↓
    │   Reads Google Sheets members
    │         ↓
    │   GmailApp.sendEmail() to each member
    │
    ├── Twilio SMS → all mobile numbers
    ├── Twilio WhatsApp → all whatsapp numbers
    └── Firebase FCM → all device tokens
```

---

## Updating the Script

After any code changes:
1. In Apps Script, click **Deploy → Manage deployments**
2. Click the ✏️ edit icon on your deployment
3. Change **Version** to **"New version"**
4. Click **"Deploy"**

> ⚠️ The Web App URL stays the same when you update an existing deployment — no need to update your .env.
