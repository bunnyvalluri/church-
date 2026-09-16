# KCM Platform — Security Architecture & Hardening Guide

---

## 1. Security Baseline & Threat Modeling

- **OWASP Top 10 Protections**:
  - **SQL Injection**: Prevented using Prisma ORM parameterized queries exclusively.
  - **Cross-Site Scripting (XSS)**: Strict Content Security Policy (`CSP`), HTML sanitization (`sanitize-html`), and React automatic escaping.
  - **CSRF Defense**: Enforced across state-changing API requests via origin/referer headers and Next.js SameSite cookies.
  - **Broken Object-Level Authorization (BOLA/IDOR)**: In-handler assertions ensure users can only modify their own resources or have administrative privileges.

---

## 2. Cryptographic Session Architecture

- **Algorithm**: HMAC-SHA256 authenticated sessions.
- **Verification**: Executed at edge in `middleware.ts` before reaching serverless handlers.
- **Cookies**: `HttpOnly`, `SameSite=Lax`, `Secure` (production), path restricted to `/`.

---

## 3. Secret Management & Scanner Policies

- Credentials in `.env.local` and `backend/.env` are strictly excluded by `.gitignore` (`*.local`, `.env*`).
- Automated health diagnostic scanner runs on every PR to prevent any accidental leakage of private keys or connection strings.
