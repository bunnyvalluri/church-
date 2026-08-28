# Structured Logging Architecture & Standards

## Purpose
This document specifies the structured JSON logging architecture, standardized log levels, context fields, correlation IDs, PII redaction rules, and ingestion pipelines for the Kingdom of Christ Ministries platform.

## Scope
Covers application loggers (`backend/src/utils/logger.js`, `frontend/lib/auditLogger.ts`), container stdout/stderr formats, and Loki log collectors.

## Status
> Status: Implemented

---

## 1. Structured JSON Logging Schema

All application logs are emitted to `stdout` and `stderr` as single-line structured JSON objects conforming to the standard schema:

```json
{
  "timestamp": "2026-08-28T14:30:15.123Z",
  "level": "INFO",
  "service": "kcm-frontend",
  "correlationId": "req_8f7e6d5c-4b3a-2a1b",
  "actorId": "usr_cuid12345",
  "action": "EVENT_REGISTRATION_CREATED",
  "message": "Member registered successfully for event",
  "context": {
    "eventId": "evt_breakthrough2026",
    "remainingSeats": 420
  }
}
```

---

## 2. Standardized Log Levels

| Level | Usage Standard | Ingestion Priority | Alerting Trigger |
| :--- | :--- | :---: | :---: |
| **`DEBUG`** | Verbose execution details for local development troubleshooting | Filtered in Prod | None |
| **`INFO`** | Normal operational events (User login, event published, receipt generated)| Standard | None |
| **`WARN`** | Recoverable issues (Rate limit reached, retry attempts, cache misses) | High | Aggregated in Grafana |
| **`ERROR`** | Unhandled exceptions, failed database writes, gateway 5xx errors | Critical | Triggers Slack alert |
| **`FATAL`** | System crash, unrecoverable database outage, cluster eviction | Emergency | Triggers PagerDuty alert |

---

## 3. Automated PII Masking & Redaction

The logger applies regex sanitizers before serializing log objects:
```typescript
const SENSITIVE_KEYS = ["password", "token", "secret", "panNumber", "cvv", "creditCard", "auth"];

export function maskSensitiveData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const cloned = { ...obj };
  for (const key of Object.keys(cloned)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      cloned[key] = "[REDACTED]";
    } else if (typeof cloned[key] === "object") {
      cloned[key] = maskSensitiveData(cloned[key]);
    }
  }
  return cloned;
}
```

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Logs in Grafana Loki appearing unparsed as raw text | Pod emitting multi-line formatted strings instead of JSON | Ensure all log output routes through `logger.info(message, context)` to maintain single-line JSON format. |
| Missing correlation IDs across microservice calls | Downstream service not forwarding `X-Correlation-ID` header | Ensure HTTP client interceptors forward correlation headers on outbound requests. |

---

## Security Considerations
- Plaintext credentials and cryptographic keys are never written to log outputs.
- Log access in Grafana Loki is restricted to authorized operations personnel.

## Related Documentation
- [Loki.md](Loki.md) — Grafana Loki log aggregation.
- [Observability.md](Observability.md) — Trace and log correlation.
- [Privacy.md](Privacy.md) — PII protection standards.
