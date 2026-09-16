# KCM Email Reliability Agent

## 1. Overview
The **KCM Email Reliability Agent** is an autonomous, evidence-based observability engine built to safeguard email communications for Kingdom of Christ Ministries.

---

## 2. Decision Tree & Diagnostic Flow

```
                      ┌───────────────────────────────────────────────┐
                      │              Periodic Agent Probe             │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │    1. Provider API Connection Check           │
                      │    - Resend Domains List Probe                │
                      │    - Latency Measurement                      │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │    2. Sender Domain Verification Audit        │
                      │    - Check if hasVerifiedDomain === true      │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │    3. Neon DB Delivery Metrics Probe          │
                      │    - Query email_events in last 60 min        │
                      │    - Check consecutive auth email failures    │
                      │    - Check failure rate %                     │
                      └───────────────────────┬───────────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
            ┌─────────────────────────┐               ┌─────────────────────────┐
            │   No Anomalies Detected │               │ Incident Detected       │
            │   Status: OPERATIONAL   │               │ Status: OUTAGE/DEGRADED │
            └────────────┬────────────┘               └────────────┬────────────┘
                         │                                         │
                         ▼                                         ▼
            ┌─────────────────────────┐               ┌─────────────────────────┐
            │ Any Active Outage In    │               │ Deduplication Engine    │
            │ Memory?                 │               │ - In-memory cooldown    │
            │ If YES: Send Recovery   │               │   (30 minutes)          │
            │ Notification            │               │ - Aggregate occurrences │
            └─────────────────────────┘               │ - Send Critical Alert   │
                                                      │   to Vallurirahul3@     │
                                                      │   gmail.com             │
                                                      └─────────────────────────┘
```

---

## 3. Incident Deduplication & Alert Policy
- **Cooldown Window**: 30 minutes per unique `incidentKey`.
- **Alert Aggregation**: Rapid repeated failures increment an internal incident counter rather than inundating the administrator's inbox.
- **Recovery Dispatch**: When an outage transitions back to `OPERATIONAL`, the agent automatically dispatches a recovery confirmation (`[KCM RECOVERY] Production Email Service Recovered`).

---

## 4. Alert Destination
- **Designated Administrator**: `Vallurirahul3@gmail.com`
- **Security Policy**: Alert notifications strictly redact passwords, API keys, and connection strings. Only operational diagnostics (HTTP status, error codes, affected event types, correlation IDs) are dispatched.
