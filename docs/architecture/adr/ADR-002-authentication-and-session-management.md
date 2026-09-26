# ADR-002: Direct PostgreSQL + Bcrypt (12 Rounds) & Edge Session Management

## Status
`ACCEPTED`

## Context
The platform requires secure authentication supporting both email/password accounts and Google Identity Services (GIS), with role-based access control across multiple church portals (Member, Pastor, Event Manager, Admin).

## Decision
Implement a direct PostgreSQL authentication engine using:
- **Bcrypt Password Hashing**: 12 salt rounds with timing-safe comparison.
- **HttpOnly HMAC Edge Session Cookie**: Signed session tokens evaluated at the edge middleware.
- **Server-Side RBAC Enforcement**: Role requirements checked in `frontend/middleware.ts` and verified in API route guards.
- **Brute-Force Rate Limiting**: Max 5 failed attempts per 5 minutes per IP.

## Consequences
- **Positive**: Complete data ownership, zero vendor lock-in, ultra-fast edge session verification, complete resistance to credential stuffing.
- **Negative**: Requires maintaining token rotation and rate-limiting stores.
