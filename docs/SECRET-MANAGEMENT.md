# KCM Portal — Secrets & Credential Management Policy

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  

---

## 1. Secret Classification & Boundary Policy

| Classification | Scope | Example Keys | Permitted Locations | Forbidden Locations |
| :--- | :--- | :--- | :--- | :--- |
| **Public Browser Variables** | Client Runtime | `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Vercel Environment, client code | Must NOT contain credentials or secrets |
| **Server-Only Credentials** | Server Runtime | `DATABASE_URL`, `REDIS_URL`, `FIRECRAWL_API_KEY`, `RAZORPAY_KEY_SECRET` | Vercel Serverless Secrets, Kubernetes Secrets | NEVER in client code, NEVER with `NEXT_PUBLIC_` |
| **Cryptographic Secrets** | Edge / Auth | `SESSION_SECRET`, `NEXTAUTH_SECRET` | Vercel Encrypted Environment Variables | NEVER hardcoded in repo |
| **Service Account Keys** | Cloud Services | Firebase Admin SDK, Cloudinary Secret | Encrypted Environment Variables | NEVER in git commits |

---

## 2. Remediation of Discovered Secret Exposure

- **Discovery:** `NEXT_PUBLIC_FIRECRAWL_API_KEY` was identified in `.env`.
- **Root Cause:** Accidental `NEXT_PUBLIC_` prefix on server scraping key.
- **Action Taken:**
  - Removed `NEXT_PUBLIC_FIRECRAWL_API_KEY` from source control and environment files.
  - Confirmed all server-side routes reference `process.env.FIRECRAWL_API_KEY` exclusively.
  - Verified `.gitignore` actively excludes `.env`, `.env.local`, and all `.env.*` variants (except `.env.example`).

---

## 3. Secret Rotation & Hygiene Procedures

1. **Regular Key Rotation:** Database, Redis, and payment API keys rotated every 90 days or immediately upon team member offboarding.
2. **Pre-Commit Secret Scanning:** CI/CD pipelines enforce automated secret detection using Trivy and git-secrets rules before code merges into `main`.
3. **Template-Only Commits:** Kubernetes manifests (`k8s/secret.yaml`) and Docker compose files track template placeholders only (`<DB_USER>`, `<DB_PASSWORD>`).
