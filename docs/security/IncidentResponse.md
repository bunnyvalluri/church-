# Incident Response Guide
## Kingdom of Christ Ministries — Runtime Security

## Alert Severity Definitions

| Severity | Response Time | Description | Examples |
|---|---|---|---|
| **CRITICAL** | Immediate (< 5 min) | Active compromise or imminent threat | Shell in container, crypto mining, container escape |
| **HIGH** | < 30 minutes | Suspicious activity requiring investigation | kubectl exec, secrets access, unexpected process |
| **WARNING** | < 4 hours | Anomalous behavior, lower confidence | /tmp writes, unexpected network, warning accumulation |
| **INFO** | Next business day | Informational events for audit | Config changes, scale events |

---

## Incident Classification

### P0 — Critical (Treat as Active Breach)
- Shell spawned in any KCM container
- Crypto mining detected
- Container escape attempt
- Reverse shell detected
- Payment API critical event
- Kernel module load attempt
- Bulk secrets dump

### P1 — High (Investigate Immediately)
- kubectl exec into production pod (unauthorized)
- Privilege escalation attempt
- Unexpected outbound connection
- RBAC wildcard role created
- ClusterRoleBinding created
- ServiceAccount token read

### P2 — Warning (Investigate Within 4 Hours)
- Repeated /tmp writes
- Cron unexpected behavior
- Unexpected binary execution
- Alertmanager output failures

---

## Response Workflow

```
Alert Fires in Alertmanager
          │
          ▼
Review Falco event in Grafana Security Dashboard
          │
          ├── CRITICAL? → Execute critical-incident.md runbook
          │                Escalate to Security Lead NOW
          │
          ├── HIGH? → Execute specific runbook:
          │            - shell-in-container.md
          │            - privilege-escalation.md
          │            - container-escape.md
          │            - rbac-abuse.md
          │
          └── WARNING? → Investigate in Loki
                         Document in incident log
                         Tune rules if false positive
```

---

## Communication Template

### P0 Incident Notification

```
SECURITY INCIDENT — KCM Church Portal
Severity: CRITICAL
Time: [UTC timestamp]
Alert: [Falco rule name]
Affected: [pod/namespace/node]
Status: [Investigating/Contained/Resolved]

Actions taken:
1. [action]
2. [action]

Next update in: 15 minutes
```

---

## Escalation Matrix

| Scenario | First Contact | Escalation | Executive |
|---|---|---|---|
| Shell in container | Security Engineer | Security Lead (30 min) | CTO (1 hour) |
| Payment data breach | Security Lead | CTO (immediate) | Board (24 hours) |
| Container escape | Security Lead | CTO (immediate) | — |
| Node compromise | Security Lead | CTO + Cloud Provider | — |
| Data exfiltration | Security Lead | CTO + Legal | Board (24 hours) |

---

## Post-Incident Checklist

- [ ] Incident timeline documented
- [ ] Root cause identified
- [ ] Attack vector closed (patch/config)
- [ ] Secrets rotated (if exposed)
- [ ] Falco rule updated (if gap found)
- [ ] Post-mortem scheduled (P0/P1)
- [ ] Compliance team notified (if PII/financial data involved)

---

## Runbook Index

| Scenario | Runbook |
|---|---|
| Any CRITICAL alert | [critical-incident.md](../platform/security/falco/runbooks/critical-incident.md) |
| Shell in container | [shell-in-container.md](../platform/security/falco/runbooks/shell-in-container.md) |
| Privilege escalation | [privilege-escalation.md](../platform/security/falco/runbooks/privilege-escalation.md) |
| Container escape | [container-escape.md](../platform/security/falco/runbooks/container-escape.md) |
| Crypto mining | [crypto-mining.md](../platform/security/falco/runbooks/crypto-mining.md) |
| RBAC abuse | [rbac-abuse.md](../platform/security/falco/runbooks/rbac-abuse.md) |
