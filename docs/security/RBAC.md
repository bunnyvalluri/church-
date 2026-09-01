# Server-Side Role-Based Access Control (RBAC)

This document specifies the server-enforced RBAC model governing the **KCM Assistant** AI subsystem.

---

## 1. Role Hierarchy

```
SUPER_ADMIN
    │
  ADMIN
    │
  PASTOR
    │
  MEMBER
    │
  PUBLIC (Anonymous Visitor)
```

---

## 2. Permissions & Tool Mapping

| Role | Allowed AI Tools | Chat Rate Limit | Context Access |
| :--- | :--- | :--- | :--- |
| **PUBLIC** | `get_public_church_info`<br>`get_public_service_times`<br>`get_public_location`<br>`get_public_events`<br>`get_public_sermons` | 10 req / min | Public church branding, service timings, published events, published sermons. |
| **MEMBER** | All Public Tools +<br>`get_my_profile`<br>`get_my_events`<br>`get_my_prayers`<br>`create_my_prayer_request` | 30 req / min | Public church data + own member profile & prayer history (`ownerId === authUser.uid`). |
| **PASTOR** | All Member Tools +<br>`get_authorized_prayer_stats`<br>`get_authorized_ministry_info` | 60 req / min | Public & Member data + ministry aggregates and corporate prayer stats. |
| **ADMIN / SUPER_ADMIN** | All Pastor Tools + administrative diagnostics | 100 req / min | Full authorized operational view. |

---

## 3. Server-Side Derivation

- The client request body is **never trusted** for role claims (e.g. `{ role: "admin" }` is ignored).
- Role is determined exclusively from `getAuthenticatedUser(req)` which verifies the cryptographically signed server session cookie (`auth_session`) or Firebase token.
