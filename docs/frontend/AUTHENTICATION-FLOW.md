# KCM Church — Authentication & Role-Based Authorization Flow

## 1. Authentication Strategy

The platform implements a **Dual-Strategy Secure Authentication Architecture**:
1. **HttpOnly SameSite Session Cookies** (`kcm_session`) for browser clients.
2. **Bearer Authorization Tokens** for mobile PWA and external programmatic clients.

```
┌──────────────┐                  ┌────────────────────┐                  ┌─────────────────┐
│ Browser PWA  │                  │ Next.js Edge Proxy │                  │ Express Backend │
└──────┬───────┘                  └─────────┬──────────┘                  └────────┬────────┘
       │                                    │                                      │
       │ 1. POST /login (Credentials/GIS)   │                                      │
       ├───────────────────────────────────►│ Forward /api/auth/login              │
       │                                    ├─────────────────────────────────────►│
       │                                    │                                      │ 2. Validate hash
       │                                    │                                      │    or verify Google
       │                                    │                                      │    token with GIS
       │                                    │ 3. Return 200 + Signed Session       │
       │                                    │◄─────────────────────────────────────┤
       │ 4. Set HttpOnly Cookie             │                                      │
       │◄───────────────────────────────────┤                                      │
       │                                    │                                      │
       │ 5. GET /admin/dashboard            │                                      │
       ├───────────────────────────────────►│ 6. Verify HMAC in Edge Middleware   │
       │                                    │    Check role in token               │
       │                                    │    (e.g., ADMIN or SUPER_ADMIN)      │
       │ 7. Allowed: Render Dashboard       │                                      │
       │◄───────────────────────────────────┤                                      │
```

---

## 2. Google Identity Services (GIS) Flow
1. Client initializes Google One-Tap or Sign-In button with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
2. Google emits an ID token (`credential`).
3. Client forwards the credential to `POST /api/auth/google`.
4. Express backend validates audience, signature, and issuer directly using `google-auth-library` `OAuth2Client.verifyIdToken`.
5. Upon verification, the user account is created or matched, and a session token is issued.
6. Client is redirected to `/portal-select` or the appropriate portal based on role.

---

## 3. Role-Based Portal Redirection
* **`ADMIN` / `SUPER_ADMIN`** → `/admin/dashboard`
* **`PASTOR`** → `/pastor/dashboard`
* **`EVENT_MANAGER`** → `/event-manager`
* **`FIELD_VOLUNTEER`** → `/field-volunteer`
* **`MEMBER`** → `/member/profile`

