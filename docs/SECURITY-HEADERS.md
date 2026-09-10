# KCM Portal — HTTP Security Headers & RFC Compliance

**Document Version:** 2.0.0  
**Verification Date:** September 10, 2026  
**Target Domain:** `https://kcmchurch.vercel.app`  

---

## 1. Deployed HTTP Security Headers

All security headers are centralized in `frontend/next.config.js` to ensure uniform propagation across Vercel serverless edges, Docker containers, and local development.

```javascript
// frontend/next.config.js
{
  source: '/(.*)',
  headers: [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://js.stripe.com"), fullscreen=(self)' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
    { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
  ],
}
```

---

## 2. Header-by-Header Rationale

### Strict-Transport-Security (HSTS)
- **Directive:** `max-age=63072000; includeSubDomains; preload`
- **Effect:** Enforces HTTPS for 2 years across all subdomains and permits inclusion in browser HSTS preload lists. Disallows SSL stripping attacks.

### Permissions-Policy (RFC 8941 Structured Header)
- **Directive:** `camera=(self), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://js.stripe.com"), fullscreen=(self)`
- **RFC Compliance:** Formatted in strict compliance with RFC 8941 Structured Headers dictionary syntax.
- **Access Scope:**
  - `camera=(self)`: Grants camera access exclusively to same-origin pages, enabling Event Manager QR ticket scanning (`CameraCapture.tsx`).
  - `microphone=()`: Completely disabled across all origins.
  - `geolocation=()`: Completely disabled across all origins.
  - `payment`: Whitelisted for Razorpay and Stripe checkout dialogs.

### Content-Security-Policy (CSP)
- **Directives:**
  - `default-src 'self'`: Restricts default resource fetching to same origin.
  - `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com https://apis.google.com https://*.firebaseapp.com https://accounts.google.com https://www.youtube.com https://vercel.live`: Restricts executable JavaScript to trusted payment, auth, and analytics vendors.
  - `frame-ancestors 'self'`: Mitigates clickjacking attacks.
  - `object-src 'none'`: Mitigates legacy Flash/ActiveX plugin exploits.

### Cross-Origin-Opener-Policy & Cross-Origin-Resource-Policy
- **COOP:** `same-origin-allow-popups` (allows seamless Google OAuth and Razorpay checkout popup windows without sacrificing process isolation).
- **CORP:** `cross-origin` (allows CDN media resources to be safely shared).
