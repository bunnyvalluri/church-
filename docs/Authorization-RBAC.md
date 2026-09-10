# KCM Portal — Server-Side Role-Based Access Control (RBAC) Specification

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  

---

## 1. Role Hierarchy Matrix

The KCM platform defines 6 distinct authorization roles enforced strictly on the server:

```text
SUPER_ADMIN (Global System Authority)
     │
   ADMIN (Church Operations & Staff Management)
     │
   PASTOR (Sermons, Pastoral Care & Announcements)
     │
 EVENT_MANAGER (Events, Attendance & Media Publishing)
     │
FIELD_VOLUNTEER (Event Scanning & Volunteer Operations)
     │
  MEMBER (Member Portal, Giving History & Personal Requests)
```

---

## 2. Server-Side Enforcement Architecture

### Principle of Zero Client Trust
No role, permission flag, or user ID submitted in request bodies or query parameters is trusted. The server derives authorization exclusively from the validated database session:

1. **Edge Middleware Pre-Filter (`frontend/middleware.ts`):**
   - Intercepts requests before reaching application code.
   - Evaluates path prefixes against verified role claims.
   - Denies unauthorized access with HTTP 401 (Unauthenticated) or HTTP 403 (Unauthorized).

2. **Route Handler Session Resolution (`frontend/lib/session.ts`):**
   - Protected API handlers call `getServerSession()` or `requireAuth(req, allowedRoles)`.
   - The user ID and role are loaded from the database session record.
   - Mutations on user resources verify resource ownership (`userId === session.uid`) to prevent Insecure Direct Object References (IDOR).

---

## 3. Route & Endpoint Access Matrix

| Route / API Group | Minimum Role | Enforced In Middleware | Enforced In Handler | IDOR Guard |
| :--- | :--- | :--- | :--- | :--- |
| `/admin/*`, `/api/admin/*` | `ADMIN` / `SUPER_ADMIN` | YES | YES | Global Admin Scope |
| `/pastor/*`, `/api/pastor/*` | `PASTOR` / `ADMIN` | YES | YES | Pastoral Scope |
| `/event-manager/*`, `/api/event-manager/*` | `EVENT_MANAGER` / `ADMIN` | YES | YES | Event Scope |
| `/field-volunteer/*`, `/api/field-volunteer/*` | `FIELD_VOLUNTEER` | YES | YES | Volunteer Task Scope |
| `/member/*`, `/api/member/*` | `MEMBER` | YES | YES | `userId === session.uid` |
| `/api/donations/session/verify` | Public Webhook / Auth | Strict HMAC Check | YES | Order Signature Validated |
| `/api/health`, `/api/ready` | Public Monitoring | N/A | YES | Read-Only Ping |

---

## 4. Privilege Escalation Prevention

- **Registration Gate:** The `/api/auth/register` handler ignores any `role` field in the client request body and hardcodes `role: 'MEMBER'`.
- **User Profile Update Gate:** Self-service profile update endpoints (`/api/member/profile`) prohibit modification of `role`, `isSuperAdmin`, `createdAt`, or `emailVerified` fields.
- **Admin Promotion Gate:** Role elevation to `PASTOR`, `ADMIN`, or `SUPER_ADMIN` requires an active `ADMIN` or `SUPER_ADMIN` session and creates an immutable audit record in PostgreSQL.
