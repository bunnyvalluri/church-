# KCM Platform — Observability & Monitoring Guide

---

## 1. Metrics & Telemetry

- **Prometheus Metrics**: Exposed at `:3001/metrics` on the companion server via `prom-client`.
- **System Health Dashboard**: Real-time 14-subsystem monitor at `/admin/system-health`.
- **Client Diagnostics**: Automated browser diagnostic capture on error boundaries and `/member/report`.

---

## 2. Health Monitoring Telemetry Schema

```json
{
  "name": "Database",
  "category": "Relational Storage",
  "status": "HEALTHY",
  "latencyMs": 42,
  "lastCheck": "2026-09-16T14:30:00.000Z",
  "errorCount": 0
}
```
