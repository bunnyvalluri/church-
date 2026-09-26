# Authentication & Role-Based Access Control (RBAC)

## Architecture

Authentication in the KCM Church Platform combines:
1. **Edge-Verified Cryptographic Sessions**: Low-latency token verification in Next.js Edge middleware (`middleware.ts`) using Web Crypto `HMAC-SHA256`.
2. **NextAuth 4.x / Firebase Auth Integration**: Multi-provider authentication supporting email/password and Google OAuth.
3. **Database-Backed Role Resolution**: Authoritative user roles stored in PostgreSQL.

---

## Role Matrix & Route Permissions

| Role | Allowed Portals | Allowed API Endpoints |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | `/admin/*`, `/pastor/*`, `/event-manager/*`, `/member/*` | All `/api/*` |
| `ADMIN` | `/admin/*`, `/pastor/*`, `/event-manager/*`, `/member/*` | All `/api/*` |
| `PASTOR` | `/pastor/*`, `/member/*` | `/api/pastor/*`, `/api/member/*`, `/api/sermons/*` |
| `EVENT_MANAGER` | `/event-manager/*`, `/member/*` | `/api/event-manager/*`, `/api/member/*`, `/api/events/*` |
| `FIELD_VOLUNTEER` | `/field-volunteer/*`, `/event-manager/*`, `/member/*` | `/api/field-volunteer/*`, `/api/event-manager/*`, `/api/member/*` |
| `MEMBER` | `/member/*` | `/api/member/*`, public APIs |

---

## Session Invalidation & Protection
- Cookie Name: `__Secure-next-auth.session-token` (production) / `next-auth.session-token` (development)
- Attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- Token Expiration: Automatic refresh with absolute session timeout.
- Logout: Clears cookie and terminates server-side session cache.
