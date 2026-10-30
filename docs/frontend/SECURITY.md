# KCM Church — Frontend Application Security & Threat Model

## 1. Zero Client-Side Secret Exposure
* Only variables prefixed with `NEXT_PUBLIC_` are bundled into browser bundles.
* Secret keys (`RAZORPAY_KEY_SECRET`, `FIREBASE_ADMIN_SERVICE_ACCOUNT`, `DATABASE_URL`) are isolated strictly to Node.js server runtimes.
* Automated CI secret scanner (`scripts/pre-commit-secret-scan.js`) prevents accidental credential commits.

---

## 2. Content Security Policy (CSP)
Enforced in [`next.config.js`](file:///C:/K.C.M-Portal/frontend/next.config.js):
* `default-src 'self'`
* `script-src` restricted to trusted origins (`checkout.razorpay.com`, `accounts.google.com`, `apis.google.com`)
* `frame-ancestors 'self'` to block Clickjacking
* `object-src 'none'` to block plugin exploits

---

## 3. Session Hardening & XSS Prevention
* Session cookies configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (production).
* User input rendered through React JSX escaping.
* Safe file upload restrictions (MIME validation, size ceilings) in `FileUploader.tsx`.
