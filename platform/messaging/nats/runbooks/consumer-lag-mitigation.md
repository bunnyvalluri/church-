# Operational Runbook: JetStream Consumer Lag & Backlog Mitigation

## Objective
Detect, diagnose, and resolve high consumer queue backlog in background worker pools.

## Diagnostic Steps

### 1. Identify Lagging Consumers
Check Grafana `NATS JetStream Persistence & Consumer Metrics` dashboard or run CLI check:
```bash
kubectl exec -it nats-0 -n messaging -- nats consumer report KCM_NOTIFICATIONS_STREAM
```

### 2. Scale Worker Deployment Horizontal Pod Autoscaler (HPA)
If consumer group backlog is rising due to increased church event volume:
```bash
kubectl scale deployment/email-worker -n default --replicas=10
```

### 3. Adjust AckWait or MaxAckPending Limits
If message handlers take longer than 30s causing redelivery storms:
```bash
kubectl exec -it nats-0 -n messaging -- nats consumer edit KCM_NOTIFICATIONS_STREAM EMAIL_WORKER_GROUP --ack-wait 60s
```

### 4. Verify Consumer Catch-up
```bash
kubectl exec -it nats-0 -n messaging -- nats consumer info KCM_NOTIFICATIONS_STREAM EMAIL_WORKER_GROUP
```
Check that `Num Pending` is trending down towards 0.
