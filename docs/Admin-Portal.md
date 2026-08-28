# Admin Portal Module Specification

## Purpose
This document provides the functional and technical specification for the Admin Portal, the centralized command center for system administrators to manage church members, oversee global infrastructure health, inspect security audit logs, and reconcile finances.

## Scope
Covers frontend pages in `frontend/app/admin/`, API endpoints in `frontend/app/api/admin/`, and administrative telemetry streams.

## Status
> Status: Implemented

---

## 1. Module Overview & Routes

| Route | Purpose | Permissions | Primary Components |
| :--- | :--- | :--- | :--- |
| `/admin` | Administration Overview Dashboard | `ADMIN` | Summary stat cards, quick administrative actions |
| `/admin/users` | User Directory & Role Assignment | `ADMIN` | User search table, role modal (`MEMBER`, `PASTOR`, `ADMIN`) |
| `/admin/health` | Comprehensive Infrastructure Health | `ADMIN` | Service status tiles (Postgres, Mongo, Redis, K8s) |
| `/admin/audit-logs` | Security & Operational Audit Log Viewer | `ADMIN` | Filterable MongoDB audit log stream table |
| `/admin/donations` | Financial Reconciliation & Export | `ADMIN` | Giving reports, date filters, CSV/PDF export |

---

## 2. Key Administrative Features

```mermaid
graph TD
    Admin([System Administrator]) --> AdminDashboard[/admin Dashboard]
    
    AdminDashboard --> Users[User Management: Role Elevation & Deactivation]
    AdminDashboard --> Health[Infrastructure Health: Postgres, Mongo, Redis, FCM]
    AdminDashboard --> Audit[Audit Trail: Inspect Privileged Mutations]
    AdminDashboard --> Finance[Finance Console: Reconcile Razorpay / Stripe Settlements]
    AdminDashboard --> Broadcast[System Broadcasts: Push Notifications & SMS]
```

### 2.1 User Management & Role Elevation
- Search members by name, email, or phone number.
- Assign roles (`MEMBER`, `VOLUNTEER`, `EVENT_MANAGER`, `PASTOR`, `ADMIN`).
- Deactivate or reset credentials for compromised accounts.

### 2.2 Detailed Health Monitoring (`/api/admin/health/detailed`)
Performs real-time latency probes and connectivity checks across:
- **PostgreSQL**: Measures query roundtrip time via `SELECT 1`.
- **MongoDB Atlas**: Verifies connection pool health and write latency.
- **Redis Cache**: Measures PING response time.
- **External Services**: Probes Cloudinary, Firebase Admin SDK, and httpSMS gateway status.

### 2.3 Security Audit Trail Viewer
- Queries the MongoDB `audit_events` collection with filters for actor, action type, and date range.
- Captures before-and-after diffs on administrative modifications.

---

## 3. Associated API Endpoints

- `GET /api/admin/health/detailed` — Returns detailed microservice uptime and latencies.
- `GET /api/audit-logs` — Paginated query endpoint for MongoDB audit events.
- `GET /api/system-events` — System health telemetry stream.
- `GET /api/pastor/members` — Member directory query for user administration.

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Health monitor flags PostgreSQL as `DEGRADED` | Active connection count approaching max pool bound | Inspect PgBouncer metrics in Grafana; scale PgBouncer pool if needed. |
| Audit log search times out | Missing index on queried metadata field | Ensure indexes are asserted via `ensureMongoIndexes()`. |

---

## Security Considerations
- The Admin Portal is protected by Next.js Edge Middleware and strict API token guards.
- All actions taken within the Admin Portal generate an immutable audit log entry.

## Related Documentation
- [Authorization-RBAC.md](Authorization-RBAC.md) — Admin role definitions.
- [MongoDB-Atlas.md](MongoDB-Atlas.md) — Audit event schema.
- [Health-Checks.md](Health-Checks.md) — Health check probe specifications.
