# KCM Platform — API Architecture & Reference

---

## 1. Core Endpoints Overview

### Health & Probes
- `GET /health/live`: Process uptime and memory telemetry.
- `GET /health/ready`: Database connectivity check (`SELECT 1`).
- `GET /health`: Multi-subsystem aggregated status.
- `GET /health/dependencies`: Detailed external dependency report.
- `GET /api/admin/system-health`: Comprehensive 14-service administrator dashboard telemetry (Admin only).

### Member & Public Services
- `GET /api/events`: List upcoming church events.
- `GET /api/sermons`: Browse catalog of sermons.
- `POST /api/member/report`: Submit issue or technical problem report with browser context.

### Giving & Donations
- `POST /api/donations/session`: Initialize giving transaction with payment gateway.
- `POST /api/donations/complete`: Atomic completion and verified receipt generation.
- `POST /api/webhooks/razorpay`: Verified webhook callback with HMAC signature validation.
