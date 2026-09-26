# KCM Role-Based Access Control (RBAC) & IDOR Protection

## 1. Role Hierarchy & Matrix

| Role | Access Scope | Protected Routes / Domains |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Full System Access | Audit logs, server settings, user roles, security events, all branches |
| `ADMIN` | Church Operations & Finance | Donations, payments, reports, giving configs, event management |
| `PASTOR` | Spiritual & Branch Operations | Members list, prayer requests, sermons, attendance, branch services |
| `EVENT_MANAGER`| Events & Logistics | Event creation, registration lists, QR check-in, media uploads |
| `MEMBER` | Self-Service & Community | Personal profile, giving history, prayer submissions, sermon engagement |

## 2. Insecure Direct Object Reference (IDOR) Protection
All endpoints accepting object identifiers (e.g. `/api/members/:id`, `/api/receipts/:id`, `/api/donations/:id`) enforce server-side ownership checks:

```typescript
// IDOR Verification Pattern
export async function verifyResourceOwnership(
  sessionUser: { id: string; role: string },
  resourceOwnerId: string
): Promise<void> {
  if (sessionUser.role === 'SUPER_ADMIN' || sessionUser.role === 'ADMIN') {
    return; // Authorized administrator override
  }
  if (sessionUser.id !== resourceOwnerId) {
    throw new AuthorizationError('You do not have permission to access this resource.');
  }
}
```
Client visibility guards (e.g. hidden UI buttons) are treated as UX enhancements only; server-side enforcement remains the strict security boundary.
