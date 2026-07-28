# Incident Response Runbooks Overview

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## On-Call Runbook Directory

Comprehensive step-by-step incident response runbooks are maintained in [`monitoring/runbooks/INCIDENT_RESPONSE_RUNBOOKS.md`](file:///c:/K.C.M-Portal/monitoring/runbooks/INCIDENT_RESPONSE_RUNBOOKS.md).

### Summary of Covered Incidents
- **`HIGH_CPU_USAGE`**: CPU saturation > 85%, pod scaling, and hot-node diagnosis.
- **`POD_CRASH_LOOP`**: CrashLoopBackOff, OOMKilled exit code 137 resolution, missing secrets.
- **`DATABASE_DOWN`**: PostgreSQL disconnection, PVC storage health check, failover.
- **`REDIS_CACHE_DOWN`**: Redis cache outage, eviction rate handling, graceful backend degradation.
- **`HIGH_API_LATENCY`**: API response time p95 > 2s, route-level latency isolation, DB lock analysis.
