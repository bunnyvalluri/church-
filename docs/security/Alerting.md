# Alerting — Falco Security Alerts
## Kingdom of Christ Ministries

## Alert Flow

```
Falco event → Falcosidekick → Alertmanager → Routing by severity
```

## Severity Tiers

### CRITICAL (Immediate Response)
| Alert | Trigger |
|---|---|
| `FalcoCriticalSecurityEvent` | Any CRITICAL Falco event |
| `FalcoShellSpawnedInContainer` | Shell rule match |
| `FalcoCryptoMiningDetected` | Mining binary/stratum |
| `FalcoContainerEscapeAttempt` | Escape rule match |
| `FalcoPrivilegeEscalation` | setuid/setgid syscall |
| `FalcoReverseShellDetected` | Reverse shell pattern |
| `FalcoPaymentAPICritical` | Payment API CRITICAL |
| `FalcoKubernetesPrivilegedPod` | Privileged pod created |

### HIGH (< 30 min response)
| Alert | Trigger |
|---|---|
| `FalcoHighSeverityBurst` | >5 HIGH events in 10min |
| `FalcoKubectlExecProduction` | exec into production pod |
| `FalcoKubernetesSecretsAccess` | secrets accessed |
| `FalcoUnexpectedNetworkConnection` | unexpected outbound |

### WARNING (< 4 hours)
| Alert | Trigger |
|---|---|
| `FalcoWarningEventAccumulation` | >20 warnings in 30min |
| `FalcoTmpWriteInContainer` | >50 /tmp writes/hour |

### Infrastructure Health
| Alert | Trigger |
|---|---|
| `FalcosidekickNotReceivingEvents` | No events for 5min |
| `FalcosidekickOutputFailure` | Delivery error |
| `FalcoDaemonSetNodeCoverageIncomplete` | Node without Falco |
| `FalcoKernelEventDrops` | >100 drops in 5min |

## Alertmanager Routes

```
All Falco alerts (team=security)
├── severity=critical → falco-critical receiver (0s wait, repeat 1h)
├── severity=high     → falco-high receiver (30s wait, repeat 2h)
├── severity=warning  → falco-warning receiver (1m wait, repeat 6h)
└── team=platform     → falco-platform receiver (infra health)
```

## Inhibition Rules
- Critical suppresses High for same `rule`
- High suppresses Warning for same `namespace`

## Configuring Notification Channels

Edit `platform/security/falco/alerts/falco-alertmanager-routes.yaml`:

```yaml
# Slack (uncomment and set secret)
receivers:
  - name: "falco-critical"
    slackConfigs:
      - apiURL: ""    # Set via ALERTMANAGER_SLACK_URL secret
        channel: "#security-critical"
        title: "🚨 CRITICAL: {{ .CommonAnnotations.summary }}"
        text: "{{ .CommonAnnotations.description }}"
```

## Viewing Active Alerts

```bash
# Via Alertmanager API
kubectl port-forward -n monitoring svc/alertmanager-operated 9093:9093
curl http://localhost:9093/api/v2/alerts | jq '.[] | select(.labels.team=="security")'

# Via Prometheus
# Grafana → Alerting → Alert rules → filter "falco"
```
