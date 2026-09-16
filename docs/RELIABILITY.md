# KCM Platform — Zero-Crash Reliability & Health Architecture

---

## 1. Multi-Tier Health System

The application exposes decoupled, standards-compliant health probes:

| Route | Scope | Latency Target | Status Codes |
| :--- | :--- | :---: | :---: |
| `GET /health/live` | Process Liveness (Uptime, Memory RSS/Heap) | < 5ms | `200` |
| `GET /health/ready` | Primary Database Connectivity Probe (`SELECT 1`) | < 100ms | `200` (Ready), `503` (Not Ready) |
| `GET /health` | Aggregated Multi-Service Status | < 250ms | `200` (Healthy/Degraded), `503` (Down) |
| `GET /health/dependencies` | Deep Dependency Audit (Neon, Mongo, Redis, CDN) | < 500ms | `200` (Operational), `503` (Degraded) |

### Non-Fabrication Rule
Health probes never return `healthy` if a dependency is failing or bypassed. Bypassed services return `offline` or `degraded`.

---

## 2. API Client Reliability (`lib/apiClient.ts`)

- **Exponential Backoff with Jitter**:
  ```typescript
  const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt)) + Math.floor(Math.random() * 200);
  ```
- **Idempotency Keys**: All mutating calls (`POST`, `PUT`, `PATCH`, `DELETE`) automatically attach a unique `Idempotency-Key` header to prevent duplicate execution during network retries.
- **Request Cancellation**: Callers can link standard `AbortSignal` instances for instant teardown on route change or user cancel.
- **Status Classification**:
  - `400/422`: `VALIDATION_ERROR`
  - `401`: `AUTH_REQUIRED`
  - `403`: `FORBIDDEN`
  - `404`: `NOT_FOUND`
  - `409`: `CONFLICT`
  - `429`: `RATE_LIMITED`
  - `408/504`: `TIMEOUT`
  - `500/502/503`: `SERVER_ERROR`
