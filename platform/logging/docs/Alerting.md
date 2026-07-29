# Log Alerting Specification

## Alert Rule Catalog

| Alert Name | Condition | Severity | Notification Channel |
| :--- | :--- | :--- | :--- |
| `HighApplicationErrorRate` | >10 error logs/sec over 2 min | Critical | PagerDuty / Slack #ops-alerts |
| `ContainerCrashLoopBackOff` | K8s Event exporter captures CrashLoopBackOff | Critical | Slack #ops-alerts |
| `FirebaseAuthFailureSpike` | >5 auth failure events over 2 min | Warning | Slack #security-alerts |
| `DatabaseSlowQueriesHighRate` | >2 slow queries (>200ms) over 3 min | Warning | Slack #db-alerts |
| `FalcoSecurityThreatDetected` | Falco warning/critical rule triggered | Critical | PagerDuty Security On-call |
| `LokiStorageNearCapacity` | Chunk memory usage > 85% | Warning | Slack #ops-alerts |
