# KCM Portal — Incident Response & Triage Framework

## 1. Incident Severity Classification Matrix

| Severity Level | Definition | Impact Scope | Initial Response Target | Communication Cadence |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Core outage: Total website downtime, payment webhook failures, database unavailability, or authentication outage. | All users / Critical business flow | **< 15 Minutes** | Hourly stakeholder updates |
| **SEV-2 (Major)** | Degraded service: Media upload failures, real-time WebSocket disconnects, elevated latency (p95 > 1s), or branch offline sync delays. | Substantial cohort of users | **< 30 Minutes** | Every 2 hours |
| **SEV-3 (Minor)** | Non-critical component degradation: Background reporting delayed, minor UI visual bug, or non-blocking email retry queue backlog. | Low user impact | **< 2 Hours** | Daily updates |
| **SEV-4 (Low)** | Informational or cosmetic anomalies, non-urgent metric warnings. | Negligible impact | Next sprint | As needed |

---

## 2. Standard Incident Lifecycle Protocol

```
+-----------------------------------------------------------------------------------+
|                        INCIDENT RESPONSE LIFECYCLE                                |
|                                                                                   |
|  [ 1. DETECT ] ----> Prometheus Alert / Sentry Error / Customer Escalation        |
|         |                                                                         |
|         v                                                                         |
|  [ 2. TRIAGE ] ----> Classify Severity (SEV-1 to SEV-4) & Assign Incident Lead   |
|         |                                                                         |
|         v                                                                         |
|  [ 3. CONTAIN ] ---> Enable circuit breakers, rate limits, or trigger rollback   |
|         |                                                                         |
|         v                                                                         |
|  [ 4. RECOVER ] ---> Restore service via runbooks, database PITR, or DNS failover|
|         |                                                                         |
|         v                                                                         |
|  [ 5. VERIFY ] ----> Execute automated health checks & smoke tests                |
|         |                                                                         |
|         v                                                                         |
|  [ 6. LEARN ] -----> Publish Post-Incident Review (PIR) within 48 hours           |
+-----------------------------------------------------------------------------------+
```

---

## 3. Communication & Escalation Protocols

- **Incident Commander (IC)**: Leads triage, coordinates remediation, and approves rollbacks.
- **Communications Lead**: Prepares external church leadership alerts and status banner updates.
- **Operations Channel**: Real-time triage conducted in `#incident-war-room`.
