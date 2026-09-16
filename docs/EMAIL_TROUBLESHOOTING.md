# KCM Email Troubleshooting & Operations Runbook

## 1. Troubleshooting Common Failure Modes

### Incident 1: Resend HTTP 403 `validation_error` (Unverified Domain)
- **Symptom**: Email deliveries fail with error:
  `You can only send testing emails to your own email address... To send emails to other recipients, please verify a domain at resend.com/domains...`
- **Root Cause**: The Resend account does not have a verified domain matching the `From` address. Resend's free tier only permits sending from `onboarding@resend.dev` to the registered account owner's email address.
- **Resolution**:
  1. Open [resend.com/domains](https://resend.com/domains).
  2. Click **Add Domain** and enter `kcmchurch.com`.
  3. Copy the generated DNS records:
     - **SPF**: TXT record on root or subdomain.
     - **DKIM**: TXT records (`resend._domainkey`).
     - **MX**: MX record if inbound routing is desired.
  4. Once verified in Resend, update environment variables:
     ```env
     EMAIL_FROM_ADDRESS="notifications@kcmchurch.com"
     EMAIL_FROM_NAME="Kingdom of Christ Ministries"
     ```

---

### Incident 2: SMTP Fallback Authentication Failure (Gmail)
- **Symptom**: Provider logs report:
  `535-5.7.8 Username and Password not accepted`
- **Root Cause**: Google disables standard account passwords for SMTP. A dedicated Google App Password must be created.
- **Resolution**:
  1. Sign in to Google Account (`kingofchristministries23@gmail.com`).
  2. Go to **Security** → **2-Step Verification** → **App passwords**.
  3. Generate a 16-character App Password for "Mail".
  4. Configure in `.env.local` / Vercel Environment Variables:
     ```env
     SMTP_HOST="smtp.gmail.com"
     SMTP_PORT="465"
     SMTP_SECURE="true"
     SMTP_USER="kingofchristministries23@gmail.com"
     SMTP_PASS="xxxx xxxx xxxx xxxx"
     ```

---

### Incident 3: Rate Limiting (HTTP 429)
- **Symptom**: Provider returns HTTP 429 during bulk announcement sends.
- **Root Cause**: Exceeded provider concurrency quota.
- **Resolution**: The system automatically applies exponential backoff with jitter and retries up to 3 times. For large member broadcasts, stagger dispatches using queue batching.

---

### Incident 4: Webhook Replay / Rejection
- **Symptom**: Provider webhooks fail with HTTP 401.
- **Resolution**: Verify that `RESEND_WEBHOOK_SECRET` matches the signing secret displayed in the Resend Webhooks console.
