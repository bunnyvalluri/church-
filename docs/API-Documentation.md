# REST & WebSocket API Specification

## Purpose
This document provides the comprehensive, authoritative API specification for all Next.js Serverless Route Handlers and companion Express / Socket.io API endpoints in the Kingdom of Christ Ministries platform.

## Scope
Covers all endpoints under `frontend/app/api/*` and `backend/server.js`.

## Status
> Status: Implemented

---

## 1. Authentication & Identity APIs

### `POST /api/auth/register`
- **Purpose**: Registers a new church member account.
- **Authentication**: None (Public).
- **Rate Limit**: 10 requests / 15 min per IP.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "credential": "<SECURE_USER_CREDENTIAL>",
    "phone": "+919876543210",
    "address": "Hyderabad, Telangana"
  }
  ```
- **Responses**:
  - `201 Created`: `{ "success": true, "user": { "id": "cuid...", "email": "..." } }`
  - `400 Bad Request`: `{ "error": "Email already registered" }`

### `POST /api/auth/login`
- **Purpose**: Authenticates credentials and sets encrypted session cookie.
- **Authentication**: None (Public).
- **Rate Limit**: 5 requests / 15 min per IP.
- **Request Body**: `{ "email": "john.doe@example.com", "credential": "<USER_CREDENTIAL>" }`
- **Responses**:
  - `200 OK`: Sets `kcm_session` HttpOnly cookie.
  - `401 Unauthorized`: `{ "error": "Invalid email or credentials" }`

### `POST /api/auth/sync`
- **Purpose**: Synchronizes and verifies Google OAuth ID Token.
- **Authentication**: Google ID Token Bearer or Body payload.
- **Request Body**: `{ "credential": "eyJhbGciOiJSUzI1NiIs..." }`
- **Responses**:
  - `200 OK`: `{ "success": true, "user": { "id": "...", "role": "MEMBER" } }`

---

## 2. Event Management APIs

### `GET /api/events`
- **Purpose**: Returns paginated list of church events.
- **Query Params**: `?branchId=...&category=...&status=PUBLISHED&page=1&limit=10`
- **Responses**:
  - `200 OK`: `{ "events": [...], "total": 45, "page": 1 }`

### `POST /api/events`
- **Purpose**: Creates a new church event.
- **Authentication**: Required (`role in ['PASTOR', 'ADMIN', 'EVENT_MANAGER']`).
- **Request Body**:
  ```json
  {
    "title": "Annual Youth Breakthrough Summit",
    "slug": "annual-youth-breakthrough-summit-2026",
    "description": "Powerful 3-day spiritual gathering...",
    "date": "2026-10-15T09:00:00.000Z",
    "time": "09:00 AM",
    "location": "Shapur Nagar Sanctuary, Hyderabad",
    "category": "Youth",
    "registrationRequired": true,
    "registrationLimit": 500,
    "image": "https://res.cloudinary.com/..."
  }
  ```
- **Responses**:
  - `201 Created`: `{ "success": true, "event": { "id": "...", ... } }`

### `POST /api/events/[id]/register`
- **Purpose**: Registers an attendee for an event with atomic seat decrement.
- **Authentication**: Optional (Guest or Member).
- **Request Body**: `{ "name": "...", "email": "...", "phone": "..." }`
- **Responses**:
  - `201 Created`: `{ "success": true, "registrationId": "...", "qrToken": "..." }`
  - `409 Conflict`: `{ "error": "Event capacity reached" }`

### `POST /api/events/[id]/check-in`
- **Purpose**: Validates QR badge ticket and marks attendance.
- **Authentication**: Required (`role in ['VOLUNTEER', 'EVENT_MANAGER', 'PASTOR', 'ADMIN']`).
- **Request Body**: `{ "qrToken": "...", "registrationId": "..." }`
- **Responses**:
  - `200 OK`: `{ "success": true, "memberName": "John Doe", "checkInTime": "..." }`

---

## 3. Sermon Catalog & Engagement APIs

### `GET /api/sermons`
- **Purpose**: Retrieves filtered list of sermons.
- **Query Params**: `?q=healing&speaker=Pastor+David&seriesId=...`
- **Responses**:
  - `200 OK`: `{ "sermons": [...] }`

### `POST /api/sermons/[id]/like`
- **Purpose**: Likes or unlikes a sermon.
- **Authentication**: Required (`MEMBER`).
- **Responses**:
  - `200 OK`: `{ "liked": true, "likeCount": 142 }`

### `POST /api/sermons/[id]/bookmark`
- **Purpose**: Saves sermon to member's personal library.
- **Authentication**: Required (`MEMBER`).
- **Responses**:
  - `200 OK`: `{ "bookmarked": true }`

---

## 4. Online Giving & Payment APIs

### `POST /api/donations/create-order`
- **Purpose**: Initializes a Razorpay or Stripe payment order.
- **Request Body**:
  ```json
  {
    "amount": 5000,
    "currency": "INR",
    "purpose": "TITHE",
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "donorPhone": "+919876543210"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "orderId": "order_H123456", "key": "rzp_test_..." }`

### `POST /api/donations/generate-qr`
- **Purpose**: Generates dynamic UPI QR code with session tracking.
- **Request Body**: `{ "amount": 1000, "purpose": "OFFERING" }`
- **Responses**:
  - `200 OK`: `{ "sessionId": "ses_abc123", "qrImageUrl": "data:image/png;base64...", "upiUri": "upi://pay?..." }`

### `POST /api/payments/webhook`
- **Purpose**: Webhook handler receiving asynchronous payment captures.
- **Authentication**: HMAC signature (`X-Razorpay-Signature` or `stripe-signature`).
- **Responses**:
  - `200 OK`: `{ "status": "received" }`

---

## 5. Media Upload Handlers

### `POST /api/upload/[category]`
- **Categories**: `event-image`, `event-video`, `sermon`, `profile-image`, `ngo-media`.
- **Payload**: `multipart/form-data` with `file` buffer.
- **Authentication**: Required (`MEMBER` for profile, `PASTOR`/`ADMIN` for sermon/events).
- **Responses**:
  - `200 OK`: `{ "success": true, "url": "https://res.cloudinary.com/...", "publicId": "church-platform/..." }`

---

## 6. System Health & Telemetry

### `GET /api/health`
- **Purpose**: Liveness probe returning operational status.
- **Responses**: `200 OK`: `{ "status": "ok", "timestamp": "...", "uptime": 184200 }`

### `GET /api/ready`
- **Purpose**: Readiness probe asserting PostgreSQL and Redis connectivity.
- **Responses**:
  - `200 OK`: `{ "ready": true, "database": "connected", "redis": "connected" }`
  - `503 Service Unavailable`: `{ "ready": false, "error": "Database unreachable" }`

---

## Security Considerations
- All mutating endpoints enforce Zod request schema validation.
- Endpoints enforce CORS headers and rate-limiting middleware.

## Related Documentation
- [Authentication.md](Authentication.md) — Session and token verification.
- [Authorization-RBAC.md](Authorization-RBAC.md) — Endpoint permission mappings.
- [Health-Checks.md](Health-Checks.md) — Kubernetes probe specifications.
