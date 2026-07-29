# Operational Runbook: Dead Letter Queue (DLQ) Drain & Message Reprocessing

## Objective
Inspect, drain, and reprocess failed messages captured in the NATS JetStream Dead Letter Queue (`audit.logs.dlq.>`).

## Step-by-Step Procedure

### 1. View DLQ Stream Message Count
```bash
kubectl exec -it nats-0 -n messaging -- nats stream info KCM_AUDIT_STREAM
```

### 2. View Failed Messages in DLQ Subject
```bash
kubectl exec -it nats-0 -n messaging -- nats consumer next KCM_AUDIT_STREAM AUDIT_INDEXER_GROUP
```

### 3. Re-publish DLQ Message Back to Main Target Subject
Use the NATS CLI tool inside the cluster container:
```bash
kubectl exec -it nats-0 -n messaging -- nats pub email.jobs.send '{"eventId":"resubmitted-123","payload":{...}}'
```

### 4. Purge Reprocessed Messages from DLQ
```bash
kubectl exec -it nats-0 -n messaging -- nats stream purge KCM_AUDIT_STREAM --subject="audit.logs.dlq.*" -f
```
