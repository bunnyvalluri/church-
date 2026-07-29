# Operational Runbook: Kafka Broker Failure & Remediation

## Overview
This runbook provides emergency protocols when a Kafka broker pod fails, undergoes ungraceful restart, or loses contact with the KRaft quorum controller.

## Symptoms
- Alert `KafkaBrokerDown` fired in Prometheus/Grafana.
- `underreplicatedpartitions` metric > 0.
- Pod status shows `CrashLoopBackOff` or `Error`.

## Immediate Mitigation Steps

### Step 1: Inspect Pod Status
```bash
kubectl get pods -n messaging -l app.kubernetes.io/name=kafka
kubectl describe pod -n messaging <broker-pod-name>
```

### Step 2: Fetch Broker Logs
```bash
kubectl logs -n messaging <broker-pod-name> -c kafka --tail=200
```

### Step 3: Check Longhorn PV Health
```bash
kubectl get pvc -n messaging
kubectl get volume.longhorn.io -n longhorn-system
```

### Step 4: Verify KRaft Quorum State
```bash
kubectl exec -it -n messaging kcm-kafka-0 -c kafka -- kafka-metadata-shell.sh --snapshot /bitnami/kafka/data/__cluster_metadata-0/00000000000000000000.log status
```

### Step 5: Force Pod Restart (If Stuck)
```bash
kubectl delete pod -n messaging <broker-pod-name>
```
