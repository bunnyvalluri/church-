# Grafana — Security Dashboards
## Kingdom of Christ Ministries

## Dashboards Overview

9 security dashboards are auto-provisioned via ConfigMap with label `grafana_dashboard: "1"`.

| Dashboard | UID | Data Sources | Key Panels |
|---|---|---|---|
| Security Overview | `falco-security-overview` | Prometheus + Loki | Event rate by priority, top rules, cluster health |
| Falco Events | `falco-events` | Prometheus + Loki | Event stream, rule breakdown, trend |
| Container Threats | `falco-container-threats` | Prometheus + Loki | Threats by container, shell events, process anomalies |
| Pod Security | `falco-pod-security` | Prometheus | Privileged pods, PSA violations, cap abuse |
| Node Security | `falco-node-security` | Prometheus | Per-node Falco coverage, node-level threats |
| Namespace Security | `falco-namespace-security` | Prometheus | Events by namespace, PSA compliance |
| RBAC Events | `falco-rbac-events` | Prometheus + Loki | Role creation, secret access, anonymous access |
| Runtime Attacks | `falco-runtime-attacks` | Prometheus + Loki | Attack timeline, MITRE mapping, severity heat map |
| Threat Timeline | `falco-threat-timeline` | Loki | Chronological event log with severity coloring |

## Accessing Dashboards

```bash
# Port-forward Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Or via Ingress (if configured)
# https://grafana.kcm-church.com/dashboards

# All security dashboards are in the "Security" folder
```

## Dashboard Provisioning

Dashboards are provisioned via ConfigMap → Grafana sidecar:

```bash
# Check ConfigMaps are created
kubectl get configmaps -n monitoring | grep grafana-dashboard-falco

# Expected output:
# grafana-dashboard-falco-security-overview
# grafana-dashboard-falco-events
# grafana-dashboard-falco-container-threats
# grafana-dashboard-falco-pod-security
# grafana-dashboard-falco-threat-timeline

# Verify Grafana sidecar picked them up
kubectl logs -n monitoring deployment/grafana -c grafana-sc-dashboard | \
  grep -i "falco\|security" | tail -10
```

## Key Prometheus Queries Used in Dashboards

```promql
# Security Overview — event rate gauge
sum(rate(falcosidekick_falco_events_total[5m])) by (priority)

# Top 10 firing rules
topk(10, sum by (rule) (increase(falcosidekick_falco_events_total[24h])))

# Falco DaemonSet coverage %
(kube_daemonset_status_number_ready{daemonset="falco", namespace="falco"} /
 kube_daemonset_status_desired_number_scheduled{daemonset="falco", namespace="falco"}) * 100

# Critical events this week
sum(increase(falcosidekick_falco_events_total{priority="critical"}[168h]))
```

## Adding a New Dashboard

1. Create dashboard JSON in `platform/security/falco/dashboards/`
2. Add to OpenTofu module `modules/falco-monitoring/main.tf` as new ConfigMap
3. ArgoCD syncs → Grafana auto-loads

## OpenTofu Module

The `falco-monitoring` module provisions all dashboard ConfigMaps:
```
platform/opentofu/modules/falco-monitoring/main.tf
```
