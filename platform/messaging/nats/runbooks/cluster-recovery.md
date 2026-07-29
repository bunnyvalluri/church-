# Operational Runbook: NATS Cluster Disaster Recovery & Node Resync

## Objective
Remediate quorum loss, network partition split-brain, or node failure scenarios in the 3-node HA NATS cluster.

## Step-by-Step Emergency Remediation

### 1. Verify Current Pod Status
```bash
kubectl get pods -n messaging -l app.kubernetes.io/name=nats -o wide
```

### 2. Inspect NATS Cluster State & Logs
```bash
kubectl logs -n messaging -l app.kubernetes.io/name=nats --tail=100 -f
```
Look for `RAFT` election issues, split-brain quorum warnings, or storage lock errors.

### 3. Restart Unhealthy StatefulSet Pods Sequentially
```bash
kubectl rollout restart statefulset/nats -n messaging
kubectl rollout status statefulset/nats -n messaging --timeout=300s
```

### 4. Force JetStream Raft Quorum Reset (If Quorum Lost)
If 2 or more nodes crashed and JetStream stream leadership cannot be elected:
```bash
kubectl exec -it nats-0 -n messaging -- nats stream cluster step-down KCM_EVENTS_STREAM
```

### 5. Validate Cluster Connections & JetStream Health
```bash
kubectl exec -it nats-0 -n messaging -- nats server check cluster
kubectl exec -it nats-0 -n messaging -- nats stream ls
```
