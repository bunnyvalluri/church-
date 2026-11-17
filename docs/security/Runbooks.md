# Runbooks Index

> **Kingdom of Christ Ministries — Runtime Threat Response & Incident Runbooks**

This document serves as the operational index for all runtime security incident runbooks across the KCM Church Kubernetes infrastructure. Runbooks provide prescriptive step-by-step containment, investigation, and recovery procedures for Falco runtime detections.

---

## Quick Reference & MITRE ATT&CK Mapping

| Incident / Detection | Severity | Runbook Link | MITRE ATT&CK | Primary Containment Action |
| :--- | :--- | :--- | :--- | :--- |
| **Any CRITICAL Falco Alert** | `CRITICAL` | [Critical Incident Runbook](../../platform/security/falco/runbooks/critical-incident.md) | Multiple | Emergency NetworkPolicy isolation |
| **Shell Spawned in Container** | `CRITICAL` | [Shell in Container Runbook](../../platform/security/falco/runbooks/shell-in-container.md) | T1059 | Pod network quarantine & kill |
| **Privilege Escalation Attempt** | `CRITICAL` | [Privilege Escalation Runbook](../../platform/security/falco/runbooks/privilege-escalation.md) | T1548 | Revoke service account & isolate node |
| **Container Escape Detected** | `CRITICAL` | [Container Escape Runbook](../../platform/security/falco/runbooks/container-escape.md) | T1611 | Node cordon, drain & kernel check |
| **Crypto Mining Detected** | `CRITICAL` | [Crypto Mining Runbook](../../platform/security/falco/runbooks/crypto-mining.md) | T1496 | Process termination & egress block |
| **RBAC / Secrets Abuse** | `HIGH` | [RBAC & Secrets Abuse Runbook](../../platform/security/falco/runbooks/rbac-abuse.md) | T1552 | Immediate token rotation & role strip |
| **HIGH Severity Event** | `HIGH` | [High Incident Runbook](../../platform/security/falco/runbooks/high-incident.md) | Multiple | Pod triage & memory dump inspection |

---

## Response Time SLA

| Severity | Target Acknowledgment | Target Containment | Target Resolution | Escalation Path |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | < 5 minutes | < 30 minutes | < 4 hours | Security Lead → DevOps Lead → CTO |
| **HIGH** | < 30 minutes | < 2 hours | < 8 hours | Security Engineer → Security Lead |
| **WARNING** | < 4 hours | < 8 hours | < 24 hours | On-Call Engineer |
| **INFO** | Next Business Day | N/A | Next Sprint | Team Backlog |

---

## Incident Response Standard Operating Procedure (SOP)

When an alert fires via Alertmanager, Slack, or Grafana:

1. **Acknowledge (`< 5m`)**: Silence alert in Alertmanager to signal active triage and prevent alert fatigue.
2. **Isolate (`< 30m`)**: Apply the emergency isolation `NetworkPolicy` to cut off all network ingress/egress without terminating forensic state.
3. **Inspect**: Collect memory dumps, container logs (`kubectl logs -n kcm-system <pod>`), and Falco system call traces via Grafana / Loki.
4. **Remediate**: Terminate malicious pods, revoke compromised Kubernetes ServiceAccount tokens, and patch root cause via GitOps.
5. **Post-Mortem**: File an incident post-mortem within 24 hours of resolution using the template below.

---

## On-Call Rotation & Roles

Maintain an active on-call rotation in your incident management tool:

- **Primary Responder**: Security Engineer (owns triage, pod quarantine, and forensic capture)
- **Secondary Responder**: DevOps Engineer (owns infrastructure isolation, node drains, and GitOps rollbacks)
- **Escalation Contact**: Security Lead / CTO (owns external communication, regulatory notification, and breach declaration)

---

## Incident Log Template

```markdown
## Incident: [INC-YYYY-MM-DD-NNN]

**Date**: [UTC timestamp]
**Severity**: CRITICAL / HIGH / WARNING
**Alert**: [Falco rule name]
**Affected Resource**: [pod/namespace/node]
**Reported By**: Falco (automated)

### Timeline
- HH:MM UTC — Alert fired in Alertmanager
- HH:MM UTC — On-call acknowledged alert
- HH:MM UTC — Quarantine NetworkPolicy applied
- HH:MM UTC — Incident contained
- HH:MM UTC — Workload rebuilt and verified resolved

### Root Cause
[Detailed description of what triggered the detection and underlying vector]

### Impact Assessment
[Workloads affected, sensitive data access evaluation, service downtime]

### Resolution Steps
[Exact kubectl commands, GitOps PRs, or config changes applied]

### Preventative Hardening
[Falco rule additions, PSA policy changes, or RBAC tightenings]

### Post-Mortem Schedule
[Date/time for P0/P1 post-mortem review]
```

---

## Related Documentation

- [RuntimeSecurity.md](RuntimeSecurity.md) — Comprehensive runtime security platform architecture
- [IncidentResponse.md](IncidentResponse.md) — Alert classification, response workflows, and team procedures
- [ThreatDetection.md](ThreatDetection.md) — Threat matrix and MITRE ATT&CK coverage
- [Alerting.md](Alerting.md) — Prometheus rules, Alertmanager routing, and severity matrices
- [Operations.md](Operations.md) — Cluster security operations and day-2 maintenance runbooks
