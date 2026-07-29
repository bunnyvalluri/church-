# CloudNativePG Automatic & Manual Failover Runbook

## Overview
CloudNativePG provides zero-downtime automatic failover via Kubernetes native lease-based leader election. If the primary PostgreSQL instance crashes or becomes unresponsive, the operator automatically promotes the most up-to-date standby replica to Primary within seconds.

---

## 1. Automatic Failover Mechanism
1. **Heartbeat & Probes**: Operator constantly checks pod readiness and PostgreSQL responsiveness.
2. **Leader Promotion**: Upon primary failure detection, the operator selects the replica with the highest LSN (Log Sequence Number).
3. **Traffic Rerouting**: The `kcm-db-cluster-rw` Service is updated to target the newly promoted primary pod.
4. **Replica Re-synchronization**: Remaining standbys re-point streaming replication (`pg_rewind`) to the new primary.

---

## 2. Manual Switchover Procedure (Planned Maintenance)

To gracefully trigger a switchover (e.g., node drain, maintenance):

```bash
# 1. Promote replica 2 to primary gracefully
kubectl cnpg switchover kcm-db-cluster --target-instance kcm-db-cluster-2 -n kcm-database

# 2. Verify status
kubectl cnpg status kcm-db-cluster -n kcm-database
```

---

## 3. Post-Failover Verification Checklist

- [ ] Confirm primary pod status: `kubectl get pods -n kcm-database -l cnpg.io/cluster=kcm-db-cluster`
- [ ] Check cluster replication status: `kubectl cnpg status kcm-db-cluster -n kcm-database`
- [ ] Validate write traffic on PgBouncer RW pooler: `kubectl logs -n kcm-database -l cnpg.io/poder=kcm-db-pooler-rw`
- [ ] Verify Prometheus replication lag alerts resolved.
