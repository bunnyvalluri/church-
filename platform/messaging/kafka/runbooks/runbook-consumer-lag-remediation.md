# Operational Runbook: Consumer Lag Remediation

## Overview
Remediation protocol when consumer group lag exceeds 5000 messages or processing latency spikes.

## Diagnostics
1. Check lag per topic and partition:
   ```bash
   kubectl exec -it -n messaging kcm-kafka-0 -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group kcm-notification-group
   ```
2. Inspect worker consumer pod logs for unhandled exceptions or blocked downstream calls (e.g. database locks).
3. Check pod CPU/Memory usage and scale consumer deployment horizontal replicas up to match topic partition count:
   ```bash
   kubectl scale deployment -n backend kcm-notification-worker --replicas=12
   ```
