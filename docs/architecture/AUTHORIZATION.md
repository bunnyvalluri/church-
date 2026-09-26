# KCM Portal — Server-Side Authorization & RBAC Architecture

## 1. Role-Based Access Control (RBAC) Hierarchy

The platform defines 4 discrete roles with strict hierarchy and server-side route boundary enforcement:

| Role Name | Identifier | Permissions & Accessible Domains |
| :--- | :--- | :--- |
| **Super Admin / Pastor** | `ADMIN` / `PASTOR` | Full system access: all branches, financial records, media uploads, OpenClaw orchestrator, user role assignment. |
| **Branch Leader** | `BRANCH_LEADER` | Scoped to assigned branch: local attendance rosters, event approvals, branch prayer requests. |
| **Event Manager** | `EVENT_MANAGER` | Event scheduling, volunteer management, QR ticket scanning, attendance reports. |
| **Church Member** | `MEMBER` | Personal profile, giving receipts, personal prayer requests, event registrations. |

---

## 2. Server-Side Enforcement (Defense-in-Depth)

1. **Edge Middleware (`frontend/middleware.ts`)**:
   - Inspects HttpOnly session cookie and validates JWT signature.
   - Redirects unauthenticated requests to `/login?next=<path>`.
2. **API Route Guards (`frontend/lib/authMiddleware.ts`)**:
   - Every protected API handler enforces role requirements:
     ```typescript
     export const POST = requireRole(['ADMIN', 'PASTOR'], async (req, session) => {
       // Handler logic executing with guaranteed authorization
     });
     ```
3. **Database-Level IDOR Protection**:
   - Handlers verify that the querying user ID owns the requested resource (e.g. member donation receipt) unless the user holds `ADMIN` role.
