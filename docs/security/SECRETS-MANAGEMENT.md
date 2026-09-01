# Secrets Management & Key Rotation Guidelines

This document outlines key management, Git hygiene, and rotation protocols for all credentials used in the **Kingdom of Christ Ministries (KCM)** platform.

---

## 1. Zero Secrets in Client Bundles

- **Strict Prefix Rule**: Only variables intended for public browser consumption may begin with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_APP_URL`).
- **Server Secrets Rule**: All backend API keys (`OPENROUTER_API_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DATABASE_URL`, `MONGODB_URI`, `SESSION_SECRET`) must **never** be prefixed with `NEXT_PUBLIC_` or imported into client components.

---

## 2. Git & Repository Hygiene

- **`.gitignore` Enforcements**:
  ```gitignore
  .env
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local
  *.pem
  *.key
  service-account.json
  ```
- **Secret Scanning**: All commits are checked via automated ripgrep pattern scanners to block accidental token commits.

---

## 3. Secret Rotation Schedule

| Secret | Rotation Cadence | Responsibility |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | 90 Days / Immediate on alert | Principal Engineer |
| `RAZORPAY_KEY_SECRET` | 180 Days | Finance Admin / Lead Dev |
| `SESSION_SECRET` | 90 Days | DevSecOps Lead |
| `DATABASE_URL` | 180 Days | Lead Database Admin |
