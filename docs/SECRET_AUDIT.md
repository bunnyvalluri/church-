# KCM Church — Comprehensive Secret Exposure & Security Audit

## Executive Summary
This document provides the exhaustive secret audit for the Kingdom of Christ Ministries (KCM) Church Application platform. It tracks all historical and runtime secret findings, their classifications, risk assessments, credential rotation status, and source-code remediation verification.

**Zero-Secret Policy**: In accordance with enterprise security best practices and incident response standards, this audit document NEVER stores raw secrets, live API keys, token values, hashes, or database passwords. All credentials are fully redacted with standard placeholder indicators.

---

## Secret Audit & Incident Response Matrix

| # | Secret Type | Location / Component | Detection Date | Status | Rotation Status | Remediation Status | Notes / Rationale |
|---|-------------|----------------------|----------------|--------|-----------------|--------------------|-------------------|
| 1 | Google API Key (YouTube Embed) | `https://www.youtube.com/embed/...` | 2026-09-01 | PUBLIC_CONFIGURATION | NOT_APPLICABLE | REMEDIATED | Public YouTube web player embed key loaded in sandboxed iframe for streaming sermons. Excluded via pattern wildcard. |
| 2 | Google API Key (Firebase Web Client) | `frontend/lib/firebase.ts` | 2026-09-01 | COMPROMISED | ROTATED | REMEDIATED | Legacy client config in historical commits. Migrated to `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` with strict domain restrictions. |
| 3 | Stripe / Svix Webhook Signing Secret | `frontend/tests/email-delivery-agent.spec.ts` | 2026-09-28 | MOCK_CREDENTIAL | ROTATED | REMEDIATED | Test suite static fixture replaced with dynamically generated random buffer fixture (`whsec_${dynamicMock}`). |
| 4 | Stripe Webhook Signing Secret | `docs/ENVIRONMENT_VARIABLES.md` | 2026-09-01 | PLACEHOLDER | ROTATED | REMEDIATED | Documentation template using placeholder format. Real secret stored securely in Vercel/K8s secret manager. |
| 5 | Neon PostgreSQL Database URL | `frontend/lib/issueService.ts` | 2026-09-28 | COMPROMISED | ROTATED | REMEDIATED | Hardcoded fallback connection string removed. Database access strictly server-side via `process.env.DATABASE_URL`. |
| 6 | Razorpay Payment Key ID / Secret | `docs/RAZORPAY-INTEGRATION.md` | 2026-09-28 | PLACEHOLDER | ROTATED | REMEDIATED | Documentation updated to use `<YOUR_RAZORPAY_KEY_ID>` placeholders. Real keys managed in production secret store. |
| 7 | Developer Personal Email | `.env.example` | 2026-09-28 | SENSITIVE_DATA | ROTATED | REMEDIATED | Developer email replaced with generic `admin@kcmchurch.org` placeholder. |
| 8 | Database Master Password Hint | `backend/prisma/setup-pgadmin.py` | 2026-09-28 | SENSITIVE_DATA | ROTATED | REMEDIATED | Local terminal print hint sanitized to generic setup instruction. |
| 9 | Edge Session Auth Secret Fallback | `frontend/lib/edgeSession.ts` | 2026-09-28 | UNSAFE_CONFIG | ROTATED | REMEDIATED | Permissive development fallback replaced with strict runtime exception throwing in production mode. |
| 10 | GitHub Token PAT Format String | `platform/helm/opentofu/terraform.tfvars` | 2026-09-28 | MOCK_CREDENTIAL | ROTATED | REMEDIATED | Template variable sanitized to placeholder format `YOUR_GHCR_PAT_HERE`. |

---

## KeyFinder Runtime Scan Findings (Browser & Third-Party)

| # | Item / Token Type | Origin / Domain | Risk Level | Classification | Action Taken | Current Status |
|---|-------------------|-----------------|------------|----------------|--------------|----------------|
| 1 | Web Storage JSON state | `http://localhost:3000` | NONE | FALSE_POSITIVE | Browser profile isolation / cleared | RESOLVED |
| 2 | Telemetry / Analytics Cookie | `http://localhost:3000` | NONE | FALSE_POSITIVE | Verified KCM uses `kcm_session` HttpOnly | RESOLVED |
| 3 | Next.js Router Internals | `http://localhost:3000` | NONE | FALSE_POSITIVE | Excluded framework symbol names | RESOLVED |
| 4 | Google reCAPTCHA / Warmup | `www.google.com` | NONE | FALSE_POSITIVE | Excluded third-party Google iframe cache | RESOLVED |
| 5 | Vercel Live Toolbar State | `vercel.live` | NONE | FALSE_POSITIVE | Excluded preview toolbar domain | RESOLVED |
| 6 | Pusher Transport Diagnostic | `kcmchurch.vercel.app` | NONE | PUBLIC_CONFIG | Documented benign WebSocket cache | RESOLVED |
| 7 | Church Branch Selection CUID | `kcmchurch.vercel.app` | NONE | PUBLIC_CONFIG | Documented benign UI preference | RESOLVED |
| 8 | Next-Themes UI Key | `kcmchurch.vercel.app` | NONE | PUBLIC_CONFIG | Documented benign theme preference | RESOLVED |

---

## Secret Management Architecture & Verification

1. **Local Development**:
   - Strictly isolated in `.env.local` and `.env` which are `.gitignore`d.
   - Sample configuration provided via `.env.example` using non-secret `<PLACEHOLDER>` tokens.
2. **CI / CD Pipeline**:
   - Automated secret scanning (Gitleaks) configured on every `push` and `pull_request`.
   - Build-time environment variables populated from GitHub Actions encrypted repository secrets.
3. **Production Secrets Store**:
   - Vercel Environment Variables & Kubernetes Opaque Secrets / External Secrets Operator.
   - All server credentials (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `FIREBASE_PRIVATE_KEY`) strictly isolated from client-side bundles.
