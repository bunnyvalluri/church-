# Operational Runbooks Catalog

## Available Operational Runbooks

| Runbook File | Scenario / Objective |
| :--- | :--- |
| [`cluster-recovery.md`](file:///c:/K.C.M-Portal/platform/messaging/nats/runbooks/cluster-recovery.md) | Remediate NATS cluster quorum loss or pod failure |
| [`storage-expansion.md`](file:///c:/K.C.M-Portal/platform/messaging/nats/runbooks/storage-expansion.md) | Online expansion of JetStream Longhorn storage volumes |
| [`dlq-drain-reprocess.md`](file:///c:/K.C.M-Portal/platform/messaging/nats/runbooks/dlq-drain-reprocess.md) | Inspect, drain, and reprocess Dead Letter Queue messages |
| [`consumer-lag-mitigation.md`](file:///c:/K.C.M-Portal/platform/messaging/nats/runbooks/consumer-lag-mitigation.md) | Resolve high pending message backlog on worker consumer pools |

## Runbook Access & Maintenance Rules
- Runbooks MUST be reviewed quarterly by SRE and Platform Engineering teams.
- All post-mortem actions must update runbook steps to prevent recurring issues.
