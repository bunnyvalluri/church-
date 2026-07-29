# Prometheus — Falco Metrics Reference
## Kingdom of Christ Ministries

## Metrics Overview

Falcosidekick exposes Prometheus metrics at `:2802/metrics`.
ServiceMonitor in `monitoring` namespace auto-discovers this endpoint.

## Key Metrics

```promql
# Event rate by priority (last 5 minutes)
rate(falcosidekick_falco_events_total[5m])

# Critical events in last hour
sum(increase(falcosidekick_falco_events_total{priority="critical"}[1h]))

# Top rules firing today
topk(10, sum by (rule) (increase(falcosidekick_falco_events_total[24h])))

# Falco DaemonSet coverage
(kube_daemonset_status_number_ready{namespace="falco",daemonset="falco"} /
 kube_daemonset_status_desired_number_scheduled{namespace="falco",daemonset="falco"}) * 100

# Events per namespace
sum by (k8s_ns_name) (rate(falcosidekick_falco_events_total[5m]))

# Falcosidekick delivery success rate
rate(falcosidekick_outputs_total{status="ok"}[5m]) /
rate(falcosidekick_outputs_total[5m])
```

## Alert Rules Location

`platform/security/falco/alerts/falco-prometheus-rules.yaml`

## Verify Prometheus is Scraping

```bash
kubectl port-forward -n monitoring svc/prometheus-k8s 9090:9090 &
# Browse: http://localhost:9090/targets
# Look for: monitoring/falcosidekick target → should be UP

# Direct metrics check
kubectl port-forward -n falco svc/falcosidekick 2802:2802 &
curl http://localhost:2802/metrics | grep falcosidekick_falco_events_total
```

## Recording Rules

The PrometheusRule includes pre-computed recording rules:

| Rule | Expression |
|---|---|
| `falco:events_by_priority:rate5m` | Event rate by priority |
| `falco:events_by_rule:rate5m` | Event rate by rule name |
| `falco:events_by_namespace:rate5m` | Event rate by K8s namespace |
| `falco:critical_event_total:1h` | Total critical events per hour |
