# KCM Church — Client Storage Security & Session Architecture

## Overview
This document audits all browser-side storage (`localStorage`, `sessionStorage`, cookies, and IndexedDB) across the Kingdom of Christ Ministries platform, defining security standards and validating that zero secrets or credentials reside in client storage.

---

## 1. Storage Inventory & Classification

### `localStorage` Audit

| Key Name | Scope | Stored Data Type | Sensitive? | Purpose & Defense Justification |
|---|---|---|---|---|
| `language` | Client UI | String (`en`, `te`, `hi`) | NO | User preferred locale for multilingual interface. Sanitized via strict enum matching. |
| `kcm-color-theme` | Client UI | String (`emerald`, `amber`, etc.) | NO | User selected accent palette. Strict whitelist validation. |
| `kcm-theme` | Client UI | String (`light`, `dark`, `system`) | NO | next-themes theme selector state. Contains no user data. |
| `kcm-selected-branch` | Client UI | String (Branch CUID) | NO | Non-sensitive ID of user's chosen church branch (e.g. Shapur, Subhash Nagar). KeyFinder flagged this because CUIDs look like random tokens, but it is purely a public filter ID. |
| `kcm-gallery-favorites`| Client UI | JSON Array of string IDs | NO | Array of public image IDs favorited by the visitor. |
| `kcm_deleted_images` | Client UI | JSON Array of string IDs | NO | Client-side visual filter state for deleted media items in gallery preview. |
| `pusherTransportTLS` | Third-party | JSON object | NO | Public WebSocket transport telemetry cache used by Pusher client SDK. |

### `sessionStorage` Audit

| Key Name | Scope | Stored Data Type | Sensitive? | Purpose & Defense Justification |
|---|---|---|---|---|
| `pending-contact-branch`| Client UI | String (`shapur`, `subhash`, `bahadur`) | NO | Temporary branch key passed when user clicks "Contact this branch" from location page. Cleared immediately on Contact component mount. |

### Cookies Audit

| Cookie Name | Provider / Scope | Flags | Sensitive? | Purpose & Security Controls |
|---|---|---|---|---|
| `kcm_session` | KCM Auth Core | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` | YES (Protected) | Cryptographically signed session token format: `sessionId.rawSecret.role.expiresAtMs.signature`. Verified at Edge with Web Crypto HMAC-SHA256. Inaccessible to client JavaScript (XSS-immune). |
| `NEXT_LOCALE` | i18n | `SameSite=Lax`, `Path=/` | NO | Fallback locale cookie for SSR language detection. |

---

## 2. Strict Client Storage Security Policies

1. **NO SECRETS IN WEB STORAGE**:
   Under no circumstances may passwords, database connection strings, API secrets, OAuth client secrets, or service account credentials be placed into `localStorage`, `sessionStorage`, or JavaScript-readable cookies.

2. **AUTHENTICATION IS NEVER FRONTEND-ONLY**:
   - Access control decisions are enforced by server-side Edge Middleware (`frontend/middleware.ts`) and verified cryptographically via Web Crypto API.
   - Client-side navigation guards are strictly progressive enhancements for UX; any direct HTTP request to `/api/admin/*`, `/api/pastor/*`, or protected page routes is authorized server-side.

3. **HTTPONLY COOKIE ENFORCEMENT**:
   - Session tokens are minted exclusively by server routes (`/api/auth/login`, `/api/auth/google`).
   - Cookies are set with `HttpOnly: true` (preventing document.cookie access from any third-party script or XSS payload), `Secure: true` (HTTPS only in production), and `SameSite: Lax` (CSRF defense).

4. **STORAGE ISOLATION & PURGING**:
   - When a user logs out, `/api/auth/logout` explicitly clears the `kcm_session` cookie via `maxAge: 0` and `expires: new Date(0)`.
   - The application does not store offline bearer tokens or long-lived refresh tokens in browser storage.
