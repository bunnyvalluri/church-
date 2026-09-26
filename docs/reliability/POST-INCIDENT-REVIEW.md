# Post-Incident Review (PIR) Template
## Kingdom of Christ Ministries (KCM Church Platform)

---

### Incident Summary

| Field | Value |
| :--- | :--- |
| **Incident ID** | `INC-YYYYMMDD-XXX` |
| **Date & Time** | `YYYY-MM-DD HH:MM UTC` |
| **Duration** | `X hours Y minutes` |
| **Severity** | `SEV-1 / SEV-2 / SEV-3 / SEV-4` |
| **Incident Commander** | `[Name / Role]` |
| **Lead Engineer** | `[Name / Role]` |
| **Impact Summary** | `[Brief description of user-facing impact]` |

---

### 1. User & Business Impact
- **Affected User Cohorts**: `[e.g., Public visitors, Branch pastors, Donors]`
- **Failed Requests / Transactions**: `[e.g., 0.2% of API calls, 0 lost financial transactions]`
- **Revenue / Donation Impact**: `[e.g., Delayed webhook processing, zero loss]`

---

### 2. Incident Timeline (UTC)

| Timestamp | Event / Action Taken | Actor / Detector |
| :--- | :--- | :--- |
| `00:00` | Incident begins (e.g. upstream database connection drop) | Automated telemetry |
| `00:05` | Prometheus alert `DatabaseConnectionFailure` fires | Alertmanager |
| `00:08` | Incident Commander triages and classifies incident as SEV-2 | On-call Engineer |
| `00:15` | Fallback mode enabled; read caching activated | Incident Team |
| `00:25` | Database connection pool restored; verification queries pass | Incident Team |
| `00:30` | Incident resolved; all systems reporting healthy | Incident Commander |

---

### 3. Root Cause Analysis (5 Whys)
1. **Why did the API return 500 errors?**
   - *Database connection pool was exhausted.*
2. **Why was the connection pool exhausted?**
   - *A burst of un-cached event search requests overwhelmed the active connection limit.*
3. **Why were the requests un-cached?**
   - *Redis cache TTL expired simultaneously during Sunday morning traffic surge.*
4. **Why did the database direct connection lack pooling?**
   - *Prisma was connecting directly without PgBouncer pooler mode.*
5. **Why was PgBouncer omitted?**
   - *Legacy connection string was not updated to pooled URL format.*

---

### 4. Corrective & Preventive Action Items

| Action Item | Type | Owner | Target Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| Enforce PgBouncer pooled `DATABASE_URL` in all environments | `PREVENTIVE` | Platform Eng | `2026-10-01` | `OPEN` |
| Implement client-side debounce on search inputs | `MITIGATION` | Frontend Eng | `2026-09-30` | `DONE` |
| Add synthetic health probe for PgBouncer latency | `OBSERVABILITY` | SRE | `2026-10-05` | `OPEN` |
