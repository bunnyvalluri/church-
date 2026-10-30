# Kingdom of Christ Ministries (KCM) — Complete API Inventory

**Version**: 2.4.0-production  
**Standard**: RESTful JSON with OpenAPI 3.1 Alignment  
**Authentication**: Bearer JWT / HTTP-Only Session Cookie / Google GIS / Webhook HMAC-SHA256  
**Total Documented Endpoints**: 225+ Routes across Express Modular Micro-Services and Next.js App Router  

---

## 1. Architectural Overview & Ingress Topology

The Kingdom of Christ Ministries platform implements a dual-layer API topology:

1. **High-Throughput Modular Express Backend (`:3001`)**:
   - Source: `backend/src/`
   - Handles database persistence (Neon PostgreSQL via Prisma), background queues (BullMQ & Redis), real-time streams (Socket.IO), payment verification (Razorpay HMAC-SHA256), media signing (Cloudinary), and SMS dispatch.
2. **Next.js App Router Full-Stack API Layer (`:3000`)**:
   - Source: `frontend/app/api/`
   - Handles edge data aggregation, portal UI state hydration, server-side caching, and secure proxying.

### Standard Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | For Protected Routes | Format: `Bearer <jwt_token>` |
| `X-Idempotency-Key` | `string` (UUID v4) | For Mutations | Prevents duplicate payment creation and offline sync replays |
| `X-Request-Id` | `string` (UUID v4) | Optional | Distributed trace ID propagated to logs and responses |
| `Content-Type` | `string` | For POST/PATCH/PUT | Must be `application/json` or `multipart/form-data` |

### Standard Response Envelope (`ApiResponse<T>`)

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully.",
  "meta": {
    "timestamp": "2026-10-30T07:50:00.000Z",
    "requestId": "d47490a4-c7c5-4240-a866-2ab747a6c13c",
    "durationMs": 12
  }
}
```

Standard Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_SERVER_ERROR",
    "message": "Human-readable description of error."
  },
  "meta": {
    "timestamp": "2026-10-30T07:50:00.000Z",
    "requestId": "d47490a4-c7c5-4240-a866-2ab747a6c13c"
  }
}
```

---

## 2. Express Backend Modular Domain Endpoints (`backend/src/modules/`)

### 2.1 Authentication (`/api/auth`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/google` | No | Public | Verifies Google Identity Services ID token and returns session JWT |
| `GET` | `/api/auth/session` | Optional | Public/Member | Retrieves current authenticated session details |
| `POST` | `/api/auth/logout` | Optional | Authenticated | Revokes current session and clears authentication cookies |

### 2.2 Users & Identity Management (`/api/users`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Yes | All Roles | Returns the authenticated caller's profile and roles |
| `PATCH` | `/api/users/me` | Yes | All Roles | Updates personal profile information (name, avatar, locale) |
| `PATCH` | `/api/users/:id/role` | Yes | `SUPER_ADMIN`, `ADMIN` | Promotes or demotes user RBAC roles |

### 2.3 Members Directory (`/api/members`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Yes | `SUPER_ADMIN`, `ADMIN`, `PASTOR` | Paginated search of church congregation members |
| `GET` | `/api/members/:id` | Yes | `SUPER_ADMIN`, `ADMIN`, `PASTOR` | Member detail profile with family, baptism, and tithe history |

### 2.4 Branch Campuses (`/api/branches`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/branches` | No | Public | Lists all active branch campuses (Kukatpally, Banjara Hills, Secunderabad) |
| `GET` | `/api/branches/:id` | No | Public | Detailed branch profile with service timings, location, and pastorship |

### 2.5 Events Management (`/api/events`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | No | Public | Lists published church events and special conferences |
| `GET` | `/api/events/:id` | No | Public | Returns event schedule, speaker lineup, and registration status |

### 2.6 Attendance & Physical Check-In (`/api/attendance`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | Yes | All Roles | Records QR-code or manual check-in for a service/event |
| `GET` | `/api/attendance/records` | Yes | `ADMIN`, `PASTOR`, `EVENT_MANAGER` | Queries attendance trends and event rosters |

### 2.7 Sermons & Gospel Media (`/api/sermons`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/sermons` | No | Public | Paginated list of sermons with audio/video and passage filters |
| `GET` | `/api/sermons/:id` | No | Public | Sermon detail including transcript, outline notes, and series metadata |

### 2.8 Prayer Intercession (`/api/prayers`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/prayers` | Yes | `ADMIN`, `PASTOR` | Intercessory prayer queue for pastoral care team |
| `POST` | `/api/prayers` | Optional | Public/Member | Submits a new prayer request with optional confidentiality flag |

### 2.9 Donations & Giving (`/api/donations`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/donations/create-order` | No | Public/Member | Generates Razorpay Order ID with mandatory idempotency key |
| `POST` | `/api/donations/verify` | No | Public/Member | Verifies Razorpay payment signature and issues receipt |

### 2.10 Financial Accounting & Ledger (`/api/finance`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/summary` | Yes | `SUPER_ADMIN`, `ADMIN` | High-level ledger breakdown: Tithes, Offerings, Building Fund, NGO |
| `GET` | `/api/finance/transactions` | Yes | `SUPER_ADMIN`, `ADMIN` | Detailed audit records of verified inflows and disbursements |

### 2.11 Push Notifications & FCM (`/api/notifications`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/notifications/device-token`| Yes | All Roles | Registers Firebase Cloud Messaging (FCM) web/mobile device token |
| `POST` | `/api/notifications/broadcast` | Yes | `SUPER_ADMIN`, `ADMIN`, `PASTOR` | Broadcasts push notification to church congregation segments |

### 2.12 Cloudinary Media Ingress (`/api/media`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/media/sign-upload` | Yes | `ADMIN`, `PASTOR`, `CONTENT_CREATOR` | Returns cryptographic signature for direct client-to-Cloudinary upload |
| `POST` | `/api/media/register` | Yes | `ADMIN`, `PASTOR`, `CONTENT_CREATOR` | Confirms completed asset upload and saves metadata to database |

### 2.13 NGO & Community Outreach (`/api/ngo`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/ngo/projects` | No | Public | Active charitable outreach initiatives (Medical camps, food drives, education) |
| `GET` | `/api/ngo/stats` | No | Public | Impact metrics: lives touched, meals served, aid distributed |

### 2.14 Volunteer Ministry (`/api/volunteers`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/volunteers/departments` | No | Public | Lists church ministry departments (Worship, Media, Ushers, Tech, Youth) |
| `POST` | `/api/volunteers/apply` | Optional | Public/Member | Submits volunteer department onboarding application |

### 2.15 Small Groups & Fellowship (`/api/groups`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/groups` | No | Public | Lists church small groups and weekly cottage prayer fellowships |
| `GET` | `/api/groups/:id` | No | Public | Group meeting location, leader contact, and study topics |

### 2.16 Church Announcements (`/api/announcements`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/announcements` | No | Public | Active ministry announcements, banner notices, and pastoral letters |
| `GET` | `/api/announcements/:id` | No | Public | Detailed announcement content with attachments |

### 2.17 Offline PWA Sync Engine (`/api/offline-sync`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/offline-sync/push` | Yes | All Roles | Submits queued offline mutations with conflict detection and idempotency |
| `GET` | `/api/offline-sync/pull` | Yes | All Roles | Delta-pulls latest server changes since last client sync watermark |

### 2.18 Analytics & Executive Reports (`/api/reports`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard` | Yes | `SUPER_ADMIN`, `ADMIN`, `PASTOR` | Aggregated church metrics across attendance, giving, and conversions |

### 2.19 Immutable Audit Logs (`/api/audit-logs`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | Yes | `SUPER_ADMIN` | Query tamper-evident security audit logs stored in MongoDB Atlas |

### 2.20 Super-Admin Administration (`/api/admin`)
| Method | Path | Auth Required | RBAC Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/diagnostics` | Yes | `SUPER_ADMIN`, `ADMIN` | System status, database latencies, BullMQ queue depths, memory |
| `GET` | `/api/admin/metrics` | Yes | `SUPER_ADMIN`, `ADMIN` | Real-time traffic, error rates, and system performance telemetry |

---

## 3. Platform Health Probes & Ingress Webhooks

### 3.1 Kubernetes & Cloud Liveness Probes
| Method | Path | Auth | Purpose | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health/live` | None | K8s Liveness Probe | `{ "status": "ok", "uptime": 1240, "memory": { ... } }` |
| `GET` | `/health/ready` | None | K8s Readiness Probe | Validates Prisma DB connectivity and Redis status |
| `GET` | `/health` | None | Global Health Check | Detailed status of Postgres, MongoDB, Redis, and workers |

### 3.2 Ingress Webhook Gateways
| Method | Path | Security Mechanism | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/webhooks/razorpay` | `X-Razorpay-Signature` HMAC-SHA256 | Processes `payment.captured`, `order.paid`, and refunds |
| `POST` | `/webhooks/httpsms` | Token Verification | Inbound delivery status receipts (DSR) for sent SMS messages |
| `POST` | `/webhooks/google` | OAuth Bearer / Token | Ingress for Google Workspace & Calendar synchronization |

---

## 4. Next.js App Router API Routes (`frontend/app/api/`)

The Next.js App Router exposes 193 API endpoints grouped into the following functional domains:

### 4.1 Activity & Auditing
- `GET /api/activity` — Unified church activity stream across member actions and admin updates.
- `GET /api/admin/audit-logs` — Administrative audit trail with filtering by actor, action, and IP.

### 4.2 Admin Management APIs (`/api/admin/*`)
- `/api/admin/accounts` — System administrator account provisioning and credential rotation.
- `/api/admin/attendance` & `/api/admin/attendance/data` — Attendance aggregation and filtering.
- `/api/admin/attendance/event-checkins` — Real-time event check-in records.
- `/api/admin/content` & `/api/admin/content/data` — CMS content management for banners and pages.
- `/api/admin/dashboard-data` — Central executive dashboard KPI metrics.
- `/api/admin/donations` & `/api/admin/donations/*` — In-depth donation analytics, causes, form fields, and payment config.
- `/api/admin/families` — Congregational family tree and household management.
- `/api/admin/finance` & `/api/admin/finance/reconcile` — Financial reconciliation against bank statements.
- `/api/admin/groups` — Small group rosters and leadership assignment.
- `/api/admin/members` & `/api/admin/members/*` — Member CRUD, tags, exports, and status transitions.
- `/api/admin/ngo` & `/api/admin/ngo/*` — NGO project management, volunteer approvals, and funds allocation.
- `/api/admin/openclaw-orchestrator` — Automated AI task and workflow orchestration telemetry.
- `/api/admin/pastor-management` — Branch pastorship assignments and ministerial coverage.
- `/api/admin/pledges` — Long-term faith pledges and fulfillment tracking.
- `/api/admin/prayer-requests` — Pastoral prayer assignment and answered prayer archiving.
- `/api/admin/roles` — Granular role-permission matrix configuration.
- `/api/admin/security/*` — Security rule updates, IP whitelists, and rate-limit tuning.
- `/api/admin/sermons` — Sermon catalog publishing, video embed links, and transcript uploads.
- `/api/admin/settings/*` — Church branding, campus locations, SMS gateway credentials, and notifications.
- `/api/admin/system/health` — Full system resource and dependency health monitoring.
- `/api/admin/users` — User account management, password resets, and role assignments.
- `/api/admin/volunteers` — Volunteer applications, background checks, and team rotas.

### 4.3 Congregational & Member APIs (`/api/member/*`)
- `/api/member/profile` — Member self-service profile and contact preferences.
- `/api/member/giving` — Member personal giving history and 80G tax certificates.
- `/api/member/prayers` — Member personal prayer requests and answer updates.
- `/api/member/events` — Registered events and digital ticket QR codes.
- `/api/member/groups` — Joined small groups and discussion threads.

### 4.4 Public & Outreach APIs
- `/api/contact` — Public inquiry submission and automated pastoral routing.
- `/api/newsletter` — Weekly bulletin email subscription management.
- `/api/ai/chat` — Context-aware biblical and church information AI assistant.
- `/api/i18n` — Multi-language translation string dictionary provider (Telugu, Hindi, English).
- `/api/locations` — Branch addresses, geolocation, maps, and transit guidance.

---

## 5. Security & Error Code Reference

All responses conform to HTTP status codes with strict, standardized machine-readable error codes:

| HTTP Status | Error Code | Meaning | Remediation |
| :--- | :--- | :--- | :--- |
| `400` | `BAD_REQUEST` | Validation error or malformed payload | Verify body format against Zod schema |
| `401` | `UNAUTHORIZED` | Missing or invalid authentication token | Log in via Google or credentials to obtain valid JWT |
| `403` | `FORBIDDEN` | Caller lacks the necessary RBAC permissions | Ensure account has `PASTOR`, `ADMIN`, or `SUPER_ADMIN` |
| `404` | `NOT_FOUND` | Resource or route does not exist | Check resource ID or endpoint path |
| `409` | `CONFLICT` | Optimistic lock or sync version conflict | Pull latest server watermark and re-apply mutation |
| `429` | `TOO_MANY_REQUESTS` | Rate limiter threshold exceeded | Back off exponentially using `Retry-After` header |
| `500` | `INTERNAL_SERVER_ERROR`| Unhandled server-side exception | Safe error masked; trace ID generated for logs |

---

*Document maintained by KCM Engineering Team. Automatically synchronized with route discovery engine.*
