# Runbooks Index
## Kingdom of Christ Ministries — Runtime Security

## Quick Reference

| Incident | Severity | Runbook | MITRE |
|---|---|---|---|
| Any CRITICAL Falco alert | CRITICAL | [critical-incident.md](../../platform/security/falco/runbooks/critical-incident.md) | Multiple |
| Shell spawned in container | CRITICAL | [shell-in-container.md](../../platform/security/falco/runbooks/shell-in-container.md) | T1059 |
| Privilege escalation attempt | CRITICAL | [privilege-escalation.md](../../platform/security/falco/runbooks/privilege-escalation.md) | T1548 |
| Container escape detected | CRITICAL | [container-escape.md](../../platform/security/falco/runbooks/container-escape.md) | T1611 |
| Crypto mining detected | CRITICAL | [crypto-mining.md](../../platform/security/falco/runbooks/crypto-mining.md) | T1496 |
| RBAC/secrets abuse | HIGH | [rbac-abuse.md](../../platform/security/falco/runbooks/rbac-abuse.md) | T1552 |
| HIGH severity event | HIGH | [high-incident.md](../../platform/security/falco/runbooks/high-incident.md) | Multiple |

## Response Time SLA

| Severity | Time to Acknowledge | Time to Contain | Time to Resolve |
|---|---|---|---|
| CRITICAL | 5 minutes | 30 minutes | 4 hours |
| HIGH | 30 minutes | 2 hours | 8 hours |
| WARNING | 4 hours | 8 hours | 24 hours |

## On-Call Rotation

Maintain an on-call rotation in your incident management tool.
For KCM Church:
- **Primary**: Security Engineer
- **Secondary**: DevOps Engineer
- **Escalation**: Security Lead → CTO

## Incident Log Template

```markdown
## Incident: [INC-YYYY-MM-DD-NNN]

**Date**: [UTC timestamp]
**Severity**: CRITICAL / HIGH / WARNING
**Alert**: [Falco rule name]
**Affected**: [pod/namespace/node]
**Reported by**: Falco (automated)

### Timeline
- HH:MM — Alert fired
- HH:MM — On-call acknowledged
- HH:MM — [actions taken]
- HH:MM — Incident contained
- HH:MM — Resolved

### Root Cause
[Description]

### Impact
[Workloads affected, data at risk, service disruption]

### Resolution
[Steps taken to resolve]

### Prevention
[Falco rule updates, RBAC changes, config hardening]

### Post-mortem scheduled
[Date/time if P0/P1]
```
