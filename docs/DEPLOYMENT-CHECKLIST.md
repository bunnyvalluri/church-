# KCM Portal — Full-Stack Production Deployment & Release Checklist

**Target URL:** `https://kcmchurch.vercel.app`  
**Deployment Platform:** Vercel Edge Network & Serverless Functions  
**Database:** Neon Serverless PostgreSQL  
**Caching & Pub/Sub:** Upstash Redis  

---

## 1. Pre-Deployment Static & Code Quality Gates

Before triggering any git push to `main` or Vercel release:

- [ ] **TypeScript Compilation:**
  ```bash
  npm run typecheck -w frontend
  ```
  *Requirement: Exits with code 0. Zero compiler errors.*
- [ ] **Linting & Code Quality:**
  ```bash
  npm run lint -w frontend
  ```
  *Requirement: Exits with code 0. Zero critical errors.*
- [ ] **Database Connectivity & Model Mapping:**
  ```bash
  node backend/prisma/check-db.js
  ```
  *Requirement: Resolves `./generated/client` with 16 tables and 190 live records.*

---

## 2. Environment Variables & Secret Hygiene

Verify in the Vercel Project Dashboard (`Settings` -> `Environment Variables`):

- [ ] `DATABASE_URL`: Set to production Neon pooled connection with `sslmode=require`.
- [ ] `REDIS_URL`: Set to Upstash TLS connection (`rediss://...`).
- [ ] `FIRECRAWL_API_KEY`: Configured strictly as a server-side environment variable (NO `NEXT_PUBLIC_` prefix).
- [ ] `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Configured for production payments.
- [ ] `NEXTAUTH_SECRET`: High-entropy 32-byte secret generated via `openssl rand -base64 32`.
- [ ] `COMPANION_SERVER_URL`: If backend companion daemon is deployed, set to remote HTTPS domain. If undeployed, leave empty to allow frontend safe mock sockets.

---

## 3. Security & Header Verification

- [ ] `frontend/vercel.json`: Verify no duplicate global security headers under `/(.*)` exist.
- [ ] `frontend/next.config.js`: Verify `Permissions-Policy` specifies `camera=(self)` to support QR code scanning while blocking unauthorized sensors.
- [ ] `frontend/public/sw.js`: Verify service worker `CACHE_VERSION` is updated on major releases and dynamic scripts use Stale-While-Revalidate.

---

## 4. Post-Deployment Automated Smoke Verification

Immediately following Vercel deployment completion:

- [ ] **Production Smoke Suite:**
  ```bash
  $env:PLAYWRIGHT_TEST_BASE_URL="https://kcmchurch.vercel.app"; npx playwright test tests/smoke/production-smoke.spec.ts --project=chromium-desktop
  ```
- [ ] **Cross-Browser & Mobile Drawer Suite:**
  ```bash
  $env:PLAYWRIGHT_TEST_BASE_URL="https://kcmchurch.vercel.app"; npx playwright test tests/cross-browser.spec.ts --project=chromium-desktop
  ```
- [ ] **21-Breakpoint Responsive Suite:**
  ```bash
  $env:PLAYWRIGHT_TEST_BASE_URL="https://kcmchurch.vercel.app"; npx playwright test tests/responsive.spec.ts --project=chromium-desktop
  ```
- [ ] **WCAG 2.2 AA Accessibility Suite:**
  ```bash
  $env:PLAYWRIGHT_TEST_BASE_URL="https://kcmchurch.vercel.app"; npx playwright test tests/accessibility.spec.ts --project=chromium-desktop
  ```

---

## 5. Rollback Procedure

If any critical regression is identified post-release:
1. Navigate to **Vercel Dashboard** -> **Deployments**.
2. Identify the previous stable deployment (marked `Instant Rollback Eligible`).
3. Click the three dots (`...`) -> **Promote to Production**.
4. Propagation occurs across global CDN edges in less than 30 seconds with zero downtime.
