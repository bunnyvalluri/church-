# Environment Variables Specification & Parameter Catalog

## Purpose
This document provides the complete, authoritative parameter reference catalog for all environment variables utilized across the frontend, companion backend, database layer, messaging engines, and external API integrations for the Kingdom of Christ Ministries platform.

## Scope
Covers variables defined in `.env.example`, `frontend/next.config.js`, `backend/server.js`, and Kubernetes ConfigMaps/Secrets.

## Status
> Status: Implemented

---

## 1. Environment Variable Reference Table

| Variable | Purpose | Required | Environment | Secret |
| :--- | :--- | :---: | :--- | :---: |
| `DATABASE_URL` | PostgreSQL connection string (Prisma & PgBouncer) | **Yes** | All | **Yes** |
| `DB_OFFLINE` | Bypasses live DB and uses local mock storage when "true" | No | Dev | No |
| `MONGODB_URI` | MongoDB Atlas cluster connection string for telemetry | **Yes** | All | **Yes** |
| `MONGODB_DATABASE_NAME` | MongoDB target database name (`kcm_church`) | **Yes** | All | No |
| `MONGODB_OFFLINE` | Bypasses live Mongo connection when "true" | No | Dev | No |
| `NEXTAUTH_URL` | Canonical base URL for NextAuth callbacks | **Yes** | All | No |
| `NEXTAUTH_SECRET` | 32-character secret key for JWT session encryption | **Yes** | Prod | **Yes** |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Google OAuth 2.0 Client ID for client Sign-In button | **Yes** | All | No |
| `GOOGLE_CLIENT_ID` | Server-side Google OAuth Client ID for token verification | **Yes** | All | No |
| `GOOGLE_CLIENT_SECRET` | Server-side Google OAuth Client Secret | **Yes** | Prod | **Yes** |
| `NEXT_PUBLIC_FIREBASE_API_KEY`| Firebase Web Client API key | **Yes** | All | No |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`| Firebase project ID identifier | **Yes** | All | No |
| `FIREBASE_ADMIN_SERVICE_ACCOUNT`| Base64 encoded Firebase Admin service account JSON | **Yes** | Prod | **Yes** |
| `FIRESTORE_OFFLINE` | Bypasses live Firebase verification when "true" | No | Dev | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier (`demo` in dev) | **Yes** | All | No |
| `CLOUDINARY_API_KEY` | Cloudinary account API key | **Yes** | All | No |
| `CLOUDINARY_API_SECRET` | Cloudinary account API secret | **Yes** | Prod | **Yes** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key ID for INR donations | **Yes** | All | No |
| `RAZORPAY_KEY_SECRET` | Razorpay private secret key for webhook HMAC | **Yes** | Prod | **Yes** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe publishable key for USD donations | No | All | No |
| `STRIPE_SECRET_KEY` | Stripe secret key for backend charge fulfillment | No | Prod | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | No | Prod | **Yes** |
| `OPENAI_API_KEY` | OpenAI API key for embeddings & assistant | No | All | **Yes** |
| `GEMINI_API_KEY` | Google Gemini API key for OpenClaw AI assistant | **Yes** | All | **Yes** |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for secondary fallback | No | All | **Yes** |
| `PINECONE_API_KEY` | Pinecone API key for sermon vector search | No | Prod | **Yes** |
| `PINECONE_INDEX` | Pinecone target index name (`church-sermons`) | No | All | No |
| `SMS_PROVIDER` | Active SMS engine (`httpsms` or `mock`) | **Yes** | All | No |
| `HTTPSMS_API_KEY` | httpSMS Android Gateway API token | **Yes** | Prod | **Yes** |
| `HTTPSMS_FROM_NUMBER` | Default outbound GSM phone number (`+91...`) | **Yes** | Prod | No |
| `HTTPSMS_WEBHOOK_SECRET`| Signing secret for incoming httpSMS delivery receipts | **Yes** | Prod | **Yes** |
| `EMAIL_PROVIDER` | Active transactional email provider (`resend`/`smtp`)| **Yes** | All | No |
| `RESEND_API_KEY` | Resend transactional email API key | **Yes** | Prod | **Yes** |
| `EMAIL_FROM_ADDRESS` | Official church sender address | **Yes** | All | No |
| `TWILIO_ACCOUNT_SID` | Twilio SID for WhatsApp broadcasts | No | Prod | **Yes** |
| `TWILIO_AUTH_TOKEN` | Twilio Auth token for WhatsApp broadcasts | No | Prod | **Yes** |
| `TWILIO_WHATSAPP_NUMBER` | Twilio approved WhatsApp Business sender | No | All | No |
| `GOOGLE_SHEETS_ID` | Spreadsheet ID for KCM Members Google Sheet | **Yes** | All | No |
| `GOOGLE_WEBHOOK_SECRET` | Shared secret for Apps Script member sync webhook | **Yes** | Prod | **Yes** |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting sliding window duration in ms (`900000`)| **Yes** | All | No |
| `RATE_LIMIT_MAX` | Max allowed requests per window per IP (`100`) | **Yes** | All | No |
| `FRONTEND_URL` | Public frontend URL (`https://kcmchurch.org`) | **Yes** | All | No |
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.io server connection URL | **Yes** | All | No |
| `INTERNAL_SERVICE_TOKEN`| Bearer token for secure internal service-to-service calls| **Yes** | Prod | **Yes** |

---

## 2. Environment Configuration Hierarchy

1. **Local Development**: Configured in `.env.local` (Git ignored).
2. **Kubernetes Staging / Production**: Non-sensitive variables injected via `ConfigMap` (`k8s/configmap.yaml`); sensitive variables injected via `Secret` (`k8s/secret.yaml`).

---

## Security Considerations
- Never prefix secret keys (`API_SECRET`, `PRIVATE_KEY`, `WEBHOOK_SECRET`) with `NEXT_PUBLIC_`.
- All production secrets are rotated every 90 days according to the security key rotation schedule.

## Related Documentation
- [Configuration.md](Configuration.md) — Configuration management.
- [Secrets-Management.md](Secrets-Management.md) — Kubernetes secret injection.
- [try.md](try.md) — Local environment setup.
