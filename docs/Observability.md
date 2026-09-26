# Observability, Health & Telemetry

## Endpoints

1. `/api/health` or `/health`: System liveness probe returning application runtime status and uptime.
2. `/api/health/ready` or `/health/ready`: Readiness probe verifying PostgreSQL connection, Redis queue accessibility, and external service bindings.
3. `/api/health/live` or `/health/live`: Lightweight probe for load balancer health checking.
4. `/api/health/dependencies`: Detailed breakdown of Cloudinary, Firebase, and payment gateway connectivity.

---

## Metrics & Logging

- **Prometheus Metrics**: Exported via Express Prometheus middleware (`prom-client`) on backend server (`/metrics`).
- **Structured JSON Logging**: Standardized log format with automatic redaction of passwords, tokens, API secrets, and donor payment signatures.
- **Audit Logs**: Stored in PostgreSQL `audit_logs` table for administrative actions and security mutations.
