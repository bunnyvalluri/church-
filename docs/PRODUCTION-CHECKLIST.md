# Production Deployment Checklist — Razorpay Payments

Use this checklist prior to launching live donations on `https://kcmchurch.vercel.app`.

---

## 1. Secrets & Credentials Checklist
- [ ] `RAZORPAY_KEY_ID` configured in Vercel Environment Variables (`rzp_live_...`).
- [ ] `RAZORPAY_KEY_SECRET` configured in Vercel Environment Variables (Server-Only).
- [ ] `RAZORPAY_WEBHOOK_SECRET` configured in Vercel Environment Variables and Razorpay Dashboard.
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches `RAZORPAY_KEY_ID`.
- [ ] No test keys (`rzp_test_...`) remain in production environment settings.
- [ ] `.env`, `.env.local`, and secrets are excluded in `.gitignore`.

---

## 2. Razorpay Dashboard Configuration
- [ ] Webhook URL registered: `https://kcmchurch.vercel.app/api/webhooks/razorpay`.
- [ ] Webhook active events selected: `payment.authorized`, `payment.captured`, `payment.failed`, `payment.refunded`, `order.paid`.
- [ ] Business KYC verified and live mode enabled in Razorpay.
- [ ] International payments enabled (if accepting overseas cards).
- [ ] UPI Auto-Capture set to instantaneous capture.

---

## 3. Security & Anti-Fraud Verification
- [ ] No simulation or mock bypasses available in production (`[Simulate Successful Payment]` completely removed).
- [ ] All signature verifications use timing-safe comparison (`crypto.timingSafeEqual`).
- [ ] Amount tampering verification active (paise-level check).
- [ ] Webhook deduplication active (`webhookEventId` SHA-256 keying).
- [ ] Rate limiters active on `/api/payments/create-order`, `/api/payments/verify`, and `/api/webhooks/razorpay`.

---

## 4. Frontend & Mobile User Experience
- [ ] Responsive 4-step wizard verified across Mobile (iOS/Android) and Desktop browsers.
- [ ] Dynamic UPI QR displays with crisp contrast for scanning.
- [ ] Mobile deep-links open Google Pay, PhonePe, Paytm, and BHIM apps seamlessly.
- [ ] Razorpay Checkout standard popup renders cleanly.
- [ ] Multilingual translation verified in English, Telugu (`తెలుగు`), and Hindi (`हिंदी`).
- [ ] 80G tax receipt PDF generation and download operational.
