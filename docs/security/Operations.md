# Operations — Falco Runtime Security
## Kingdom of Christ Ministries

## Daily Operations

### Morning Security Health Check

```bash
#!/bin/bash
# Run daily — verify Falco platform health

echo "=== Falco DaemonSet Status ==="
kubectl get daemonset falco -n falco -o wide

echo ""
echo "=== Falco Pod Status (all nodes) ==="
kubectl get pods -n falco -l app.kubernetes.io/name=falco -o wide

echo ""
echo "=== Falcosidekick Status ==="
kubectl get deployment falcosidekick -n falco

echo ""
echo "=== Events from last 24h (Loki query) ==="
echo "Open Grafana → Security Overview dashboard → set timerange Last 24h"

echo ""
echo "=== Active Security Alerts ==="
kubectl port-forward -n monitoring svc/alertmanager-operated 9093:9093 &
sleep 2
curl -s http://localhost:9093/api/v2/alerts | \
  jq -r '.[] | select(.labels.team=="security") | "\(.labels.severity): \(.annotations.summary)"'
kill %1
```

### Weekly Operations

```bash
# 1. Review Falco rules for updates
helm search repo falcosecurity/falco --versions | head -3

# 2. Check for rule false positives in last 7 days
# Grafana: {app="falco"} | json | priority="warning" | count by rule

# 3. Validate all ArgoCD apps are healthy
argocd app list | grep falco | awk '{print $1, $2, $8}'

# 4. Check Prometheus alert firing history
# Grafana → Alerting → Alert history → filter "falco"

# 5. Review cluster RBAC changes
kubectl get clusterrolebindings --sort-by=.metadata.creationTimestamp | tail -10
```

---

## Updating Falco Chart Version

```bash
# 1. Check latest stable version
helm search repo falcosecurity/falco

# 2. Review changelog
# https://github.com/falcosecurity/falco/blob/master/CHANGELOG.md

# 3. Update ArgoCD Application
vim kcm-church-infra/security/falco/argocd-application.yaml
# Change: targetRevision: "4.3.0" → "4.4.0"

# 4. Commit and push → CI validates → ArgoCD deploys
git commit -am "chore: upgrade Falco chart to 4.4.0"
git push origin main

# 5. Monitor rollout
kubectl rollout status daemonset/falco -n falco --timeout=300s
```

---

## Reloading Custom Rules

Rules hot-reload when the ConfigMap changes (no pod restart needed):

```bash
# Edit rules
vim platform/security/falco/rules/kcm-custom-rules.yaml

# Push → ArgoCD syncs ConfigMap → Falco detects change → hot-reload
git add . && git commit -m "security: update KCM rules" && git push

# Verify reload
kubectl logs -n falco daemonset/falco | grep "inotify"
# Expected: "inotify: reloading Falco rules"
```

---

## Scaling Falcosidekick

```bash
# Increase replicas for higher event throughput
kubectl scale deployment falcosidekick -n falco --replicas=3

# Or update via Helm values (GitOps approach)
# Edit values-falcosidekick.yaml: replicaCount: 3
# Push → ArgoCD deploys → scales up
```

---

## Backup and Recovery

```bash
# Backup current Falco configuration
kubectl get configmap falco-custom-rules -n falco -o yaml > backup-rules-$(date +%Y%m%d).yaml
helm get values falco -n falco > backup-helm-values-$(date +%Y%m%d).yaml

# Restore (if GitOps fails)
kubectl apply -f backup-rules-$(date +%Y%m%d).yaml
helm upgrade falco falcosecurity/falco -n falco -f backup-helm-values-$(date +%Y%m%d).yaml
```

---

## Metrics Reference

| Metric | Description |
|---|---|
| `falcosidekick_falco_events_total{priority,rule}` | Event count by priority and rule |
| `falcosidekick_inputs_total` | Total events received from Falco |
| `falcosidekick_outputs_total{output,status}` | Events sent to each output |
| `falco_evt_source_base_syscall_num_evts_total` | Total syscall events processed |
| `falco_evt_source_base_syscall_num_evts_dropped_total` | Dropped events (capacity issue) |
| `kube_daemonset_status_number_unavailable{daemonset="falco"}` | Missing Falco pods |

Prometheus query examples:
```promql
# Event rate by priority
rate(falcosidekick_falco_events_total[5m])

# Critical events in last 1 hour
sum(increase(falcosidekick_falco_events_total{priority="critical"}[1h]))

# Falco DaemonSet coverage %
(kube_daemonset_status_number_ready{daemonset="falco"} /
 kube_daemonset_status_desired_number_scheduled{daemonset="falco"}) * 100
```
