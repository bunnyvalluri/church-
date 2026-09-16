# KCM Church — Environment Variables Security & Architecture

## Overview
This document defines the environment variable taxonomy, isolation boundaries, rotation procedures, and deployment environment separation for Kingdom of Christ Ministries (KCM).

---

## Variable Classification & Security Boundaries

### 1. PUBLIC CLIENT VARIABLES (`NEXT_PUBLIC_*`)
These variables are embedded into JavaScript bundles during build time and sent to all browsers.
**CRITICAL RULE**: NEVER place private API keys, secrets, database credentials, or service account data under `NEXT_PUBLIC_*`.

| Variable | Scope | Purpose | Allowed Environments |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Client & Server | Canonical public domain URL (e.g. `https://kcmchurch.vercel.app`) | Dev, Preview, Prod |
| `NEXT_PUBLIC_CHURCH_NAME` | Client & Server | Organization display name | All |
| `NEXT_PUBLIC_CHURCH_ADDRESS` | Client & Server | Physical address shown in footer and contact page | All |
| `NEXT_PUBLIC_CHURCH_PHONE` | Client & Server | Public contact phone number | All |
| `NEXT_PUBLIC_CHURCH_EMAIL` | Client & Server | Public contact email address | All |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client & Server | Google Identity Services (GIS) Web Client ID | All |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client & Server | Public Firebase Web API Key for client SDK init | All |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client & Server | Firebase Auth domain | All |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client & Server | Firebase Project ID | All |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client & Server | Public storage bucket domain | All |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client & Server | Web push messaging sender ID | All |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client & Server | Firebase Web App ID | All |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Client & Server | Public Web Push VAPID key | All |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client & Server | Public Razorpay Checkout Key ID (rzp_test_* / rzp_live_*) | All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client & Server | Public Stripe publishable key (pk_test_* / pk_live_*) | All |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client & Server | Public Cloudinary cloud identifier | All |

---

### 2. SERVER-ONLY SECRETS (STRICTLY CONFIDENTIAL)
These variables MUST NEVER be prefixed with `NEXT_PUBLIC_` and are NEVER included in client bundles. They are accessible exclusively in Node.js / Edge server environments.

| Variable | Sensitive Category | Purpose | Rotation Frequency |
|---|---|---|---|
| `DATABASE_URL` | Database | PostgreSQL Neon connection string with master credentials | 90 Days / On Incident |
| `MONGODB_URI` | Database | MongoDB Atlas connection string for analytics and audit logs | 90 Days |
| `SESSION_SECRET` | Cryptographic Key | HMAC-SHA256 signing secret for `kcm_session` cookies | 180 Days |
| `JWT_SECRET` | Cryptographic Key | Token signing secret | 180 Days |
| `NEXTAUTH_SECRET` | Cryptographic Key | NextAuth session encryption key | 180 Days |
| `GOOGLE_CLIENT_SECRET` | OAuth Secret | Google OAuth 2.0 Client Secret (GOCSPX-*) | 180 Days |
| `FIREBASE_ADMIN_SERVICE_ACCOUNT` | Cloud Credential | Base64-encoded GCP Service Account private key JSON | 90 Days |
| `RAZORPAY_KEY_SECRET` | Payment Secret | Server-side Razorpay payment order and capture secret | 90 Days |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Secret | HMAC-SHA256 signature verification for payment webhooks | 180 Days |
| `STRIPE_SECRET_KEY` | Payment Secret | Server-side Stripe API secret (sk_test_* / sk_live_*) | 90 Days |
| `STRIPE_WEBHOOK_SECRET` | Webhook Secret | Stripe webhook signing secret (whsec_*) | 180 Days |
| `OPENAI_API_KEY` | AI Service Key | OpenAI API secret for sermon AI | 90 Days |
| `ANTHROPIC_API_KEY` | AI Service Key | Anthropic Claude API key | 90 Days |
| `GEMINI_API_KEY` | AI Service Key | Google Gemini AI assistant key | 90 Days |
| `OPENROUTER_API_KEY` | AI Service Key | OpenRouter aggregator secret | 90 Days |
| `FIRECRAWL_API_KEY` | AI Crawler Key | Firecrawl scraping service key | 90 Days |
| `RESEND_API_KEY` | Email Secret | Resend transactional email API key | 90 Days |
| `SMTP_PASSWORD` / `SMTP_PASS` | Email Secret | Gmail App Password or SMTP relay credential | 90 Days |
| `TWILIO_AUTH_TOKEN` | SMS Secret | Twilio account authentication token | 90 Days |
| `HTTPSMS_API_KEY` | SMS Secret | httpSMS Android gateway API key | 90 Days |
| `HTTPSMS_WEBHOOK_SECRET` | Webhook Secret | httpSMS webhook verification secret | 180 Days |

---

## Vercel Environment Configuration Architecture

Secrets must be strictly segmented across deployment tiers in Vercel:

```
┌──────────────────────────────────────────────────────────┐
│                   Vercel Environment                     │
├───────────────────┬───────────────────┬──────────────────┤
│    Development    │      Preview      │    Production    │
├───────────────────┼───────────────────┼──────────────────┤
│ .env.local (Dev)  │ Preview Secrets   │ Production       │
│ Test API keys     │ Sandbox keys      │ Live keys only   │
│ rzp_test_*        │ rzp_test_*        │ rzp_live_*       │
│ Test databases    │ Branch databases  │ Isolated prod DB │
└───────────────────┴───────────────────┴──────────────────┘
```

1. **Production**:
   - Only production secrets configured in Vercel Dashboard → Settings → Environment Variables (marked "Production" only).
   - `ALLOW_PAYMENT_SIMULATION` must be `false` or unset.
2. **Preview**:
   - Used for PR branches and staging. Uses test keys and sandbox gateways.
   - Prevents PR builds from ever touching production data or real payment gateways.
3. **Development**:
   - Kept locally in developer `.env.local` (untracked in git).
   - `.gitignore` strictly blocks all `.env` files except `.env.example`.

---

## Secret Rotation Runbook

When rotating any server-side credential:

1. **Generate New Credential**:
   Generate the replacement secret in the provider dashboard (e.g. Neon, Razorpay, Google Cloud Console).
2. **Staged Update in Vercel**:
   Update the secret in Vercel Project Settings for Production environment.
3. **Dual-Key Acceptance (where supported)**:
   For webhook secrets and API keys supporting rolling rotation, add the new secret while retaining previous secret during rollout.
4. **Trigger Deployment**:
   Trigger a production redeploy (`git push` or Vercel redeploy) to ensure all serverless instances load new environment variables.
5. **Revoke Previous Credential**:
   Once verified, permanently delete/revoke the retired secret in the external provider dashboard.
6. **Verification**:
   Run automated health check endpoint (`/api/ready` and `/api/health`) to confirm database and service connectivity.
