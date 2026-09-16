# KCM Platform — Environment Variables Reference

---

## 1. Database & Persistence

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | YES | PostgreSQL Neon connection string with SSL (`sslmode=require`) |
| `DB_OFFLINE` | NO | Set `false` in production. If `true`, bypasses real queries in local dev |
| `MONGODB_URI` | OPTIONAL | MongoDB Atlas connection string for telemetry and audit trails |
| `MONGODB_DATABASE_NAME`| OPTIONAL | Target MongoDB database name (default: `kcm_church`) |
| `REDIS_URL` | OPTIONAL | Redis endpoint for distributed BullMQ and Socket.io multi-cluster |

---

## 2. Authentication & Identity

| Variable | Required | Description |
| :--- | :---: | :--- |
| `SESSION_SECRET` | YES | 32+ character HMAC key for edge cryptographic session cookies |
| `NEXTAUTH_SECRET` | YES | Encryption secret for NextAuth token handlers |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | YES | Firebase Client Web API Key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | YES | Firebase Project ID (`kcm-church-7d324`) |
| `FIREBASE_ADMIN_SERVICE_ACCOUNT` | OPTIONAL | Base64 encoded service account JSON for server verification |

---

## 3. Payments & Communications

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | YES | Razorpay public Key ID |
| `RAZORPAY_KEY_SECRET` | YES | Razorpay private Secret Key |
| `RESEND_API_KEY` | OPTIONAL | API key for transactional email delivery |
| `HTTPSMS_API_KEY` | OPTIONAL | API key for httpSMS Android gateway |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`| YES | Cloudinary cloud identifier |
