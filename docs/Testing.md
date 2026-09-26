# Automated Testing Engine & Quality Assurance

## Overview
The KCM Church platform features an end-to-end testing engine built with **Playwright Test** that validates functional correctness, security policies, role-based access control, responsive viewports, and accessibility.

---

## Test Suites

| Suite | File / Location | Focus Area |
| :--- | :--- | :--- |
| **Route Health** | `frontend/tests/e2e/route-health.spec.ts` | 200 OK HTTP responses across all core routes |
| **RBAC Matrix** | `frontend/tests/e2e/rbac-matrix.spec.ts` | Role-based boundary enforcement & unauthorized redirects |
| **Security Headers** | `frontend/tests/e2e/security-headers.spec.ts` | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **Language Switcher**| `frontend/tests/e2e/language-switch.spec.ts` | Multilingual UI rendering (EN, TE, HI) |
| **Payments** | `frontend/tests/payments/razorpay-payments.spec.ts` | Donation form validation, UPI flows, order creation |
| **PWA Service Worker**| `frontend/tests/pwa-service-worker.spec.ts` | Scheme safety, offline caching, cache busting |
| **Accessibility** | `frontend/tests/accessibility.spec.ts` | Contrast, ARIA landmarks, keyboard navigation |
| **Responsive** | `frontend/tests/responsive.spec.ts` | Mobile (360px-390px), Tablet (768px), Desktop (1280px+) |

---

## Running Tests Locally
```bash
# Run complete test suite
npm run test

# Run health probes
npm run test:health

# Run RBAC access control suite
npm run test:rbac

# Run smoke test
npm run test:smoke
```
