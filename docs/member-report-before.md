# Member Report & Diagnostics System — Baseline State Audit (Before)
**Audit Timestamp:** 2026-09-15T21:17:00+05:30  
**Environment:** Production / Next.js 14 Monorepo (Frontend) + Express/Socket.IO Companion Server (Backend)  
**Database:** Neon PostgreSQL (`divine-smoke-01982543` / `neondb`)  

---

## 1. Existing Route & Page Inventory
- `/member/report`: **Does not exist** (returns 404).
- `/admin/support/reports`: **Does not exist** (returns 404).
- Existing member routes:
  - `/member` (Main Member Dashboard)
  - `/member/profile` (Profile & security settings)
  - `/member/events` (Church event registrations)
  - `/member/prayers` (Prayer requests)
  - `/member/sermons` (Sermon library)
  - `/member/volunteer` (Volunteer programs)
  - `/member/give` (Donations & tithes)
- Existing admin routes:
  - `/admin/dashboard`, `/admin/content`, `/admin/members`, `/admin/giving`, `/admin/settings`, etc. No unified issue reporting or support triage desk existed.

---

## 2. Database Schema (Prisma & Neon PostgreSQL)
- Existing models: `User`, `Session`, `Event`, `Sermon`, `PrayerRequest`, `Donation`, `Ministry`, `AuditLog`, etc.
- Missing models:
  - No `IssueReport` table or model existed in `frontend/prisma/schema.prisma` or `backend/prisma/schema.prisma`.
  - No issue tracking, diagnostic telemetry, or error correlation tables existed in the Neon PostgreSQL database.

---

## 3. Error Boundary State
- `frontend/app/error.tsx`:
  - Showed a general "Something went wrong!" card with "Try Again" and "Go back Home" buttons.
  - In development mode, directly rendered `error?.stack || error?.message` inside a `<pre>` element.
  - Did not have a mechanism to report the issue directly to the church technical engineering team.
  - Did not carry forward correlation IDs or error digest parameters to a structured triage system.

---

## 4. Diagnostics & Telemetry
- No client-side browser environment or device telemetry collector existed for user-facing support.
- No client-side ring buffer existed to record recent runtime errors (`window.onerror`, `unhandledrejection`, failed `fetch` calls) for context-rich issue submissions.

---

## 5. File Upload Infrastructure
- `frontend/lib/uploadSecurity.ts` provided robust file signature verification (`verifyFileSignature`) and MIME validation for images and videos.
- No endpoint existed specifically for issue screenshot uploads with authenticated member bindings and secure naming.

---

## 6. Real-Time Status Infrastructure
- `backend/server.js` supports Socket.IO with rooms `member:<uid>` and `admin`.
- Endpoint `/api/trigger-event` bridges Next.js server actions / API routes to the companion Socket.IO server.
- No issue reporting events (`report:created`, `report:status_changed`, `report:resolved`) were wired up.
