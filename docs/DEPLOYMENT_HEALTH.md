# Deployment Health & Metric Observation Specification

## 1. Multi-Probe Health Architecture

```
                                  PROBE ROUTER
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  GET /api/health     │     │  GET /api/health/live│     │  GET /api/health/ready
│  - System Aggregated │     │  - Process Liveness  │     │  - Database Probe    │
│  - Multi-Persistence │     │  - Low Overhead      │     │  - External SDKs     │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

---

## 2. Thresholds & Observation Policies

- **5xx Failure Rate**: Alert at > 5%, Rollback threshold at > 10% sustained across observation window.
- **Latency Upper Bound**: P95 threshold at 3500ms; average probe latency nominal at < 300ms.
- **Observation Window**: 30 seconds default with 3000ms polling interval.
- **Circuit Breaker Status**: Disallows unencrypted WebSocket attempts on production HTTPS.
