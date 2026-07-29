# Operational Runbook: Helm Rollback Procedures

## 1. Automated Rollback Trigger (Argo CD)
Argo CD automatically triggers rollback if `helm test` fails or health checks timeout during sync.

---

## 2. Manual Emergency Rollback via Helm CLI

```bash
# Step 1: List release history
helm history nextjs -n kcm-production

# Output Example:
# REVISION   UPDATED                  STATUS      CHART        APP VERSION   DESCRIPTION
# 1          Wed Jul 29 10:00:00 2026 SUPERSEDED  nextjs-1.1.0 2.3.0         Install complete
# 2          Wed Jul 29 12:00:00 2026 FAILED      nextjs-1.2.0 2.4.0         Upgrade failed

# Step 2: Rollback to stable revision
helm rollback nextjs 1 --namespace kcm-production --cleanup-on-fail --wait

# Step 3: Verify pod health
kubectl get pods -n kcm-production -l app.kubernetes.io/name=nextjs
```
