# Loki — Falco Log Integration
## Kingdom of Christ Ministries

## Overview

Falco events flow to Loki via two paths:
1. **Falcosidekick** → pushes JSON events directly to Loki HTTP API
2. **Promtail (Falco)** → reads `/var/log/falco/falco.log` → structured logs

## Loki Labels

| Label | Values | Source |
|---|---|---|
| `app` | `falco` | Static |
| `cluster` | `kcm-prod` | Static |
| `env` | `production` | Static |
| `priority` | `critical/high/warning/notice` | Falco event |
| `rule` | `KCM Shell Spawned...` | Falco event |
| `source` | `syscall` / `k8s_audit` | Falco event |

## Common Queries

```logql
# All Falco events
{app="falco"}

# Critical events only
{app="falco", priority="critical"}

# Specific rule
{app="falco"} | json | rule="KCM Shell Spawned in Application Container"

# Events for a specific pod
{app="falco"} | json | k8s_pod_name="kcm-backend-api-xxxx"

# Events in kcm-system namespace
{app="falco"} | json | k8s_ns_name="kcm-system"

# Payment API events
{app="falco"} | json | rule=~".*[Pp]ayment.*"

# Count events by rule in last 1 hour
sum by (rule) (count_over_time({app="falco"}[1h]))

# Last 10 critical events with full output
{app="falco", priority="critical"} | json | line_format "{{.rule}}: {{.output}}"
```

## Retention

Configure Loki retention for security audit compliance:
```yaml
# loki-stack.yaml
limits_config:
  retention_period: 90d    # 90 days for security logs
```

## Verify Events in Loki

```bash
# Port-forward Loki
kubectl port-forward -n monitoring svc/loki 3100:3100 &

# Query recent events
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={app="falco"}' \
  --data-urlencode 'limit=10' \
  --data-urlencode "start=$(date -d '5 minutes ago' +%s)000000000" \
  --data-urlencode "end=$(date +%s)000000000" \
  | jq '.data.result[].values[][1]' | head -5
```
