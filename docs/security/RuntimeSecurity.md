# Runtime Security — Kingdom of Christ Ministries

## Overview

The KCM Church Portal implements an **Enterprise Runtime Security Platform** powered by **Falco**, the industry-standard open-source cloud-native runtime threat detection engine. This platform provides real-time visibility into everything happening inside the Kubernetes cluster at the kernel system-call level using modern eBPF probes.

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│  KCM Kubernetes Cluster                                          │
│                                                                  │
│  ┌────────────────────────────────────────────┐                 │
│  │  kcm-system namespace (application pods)   │                 │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │                 │
│  │  │ API Pod  │ │ Worker   │ │ Frontend │  │                 │
│  │  │ :3001    │ │ Pod      │ │ Pod      │  │                 │
│  │  └──────────┘ └──────────┘ └──────────┘  │                 │
│  └────────────────────────────────────────────┘                 │
│            │ syscalls observed by eBPF                           │
│            ▼                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  falco namespace                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Falco DaemonSet (1 pod per node)                   │  │   │
│  │  │  • modern eBPF kernel driver                        │  │   │
│  │  │  • 200+ default rules + 5 KCM custom rule files   │  │   │
│  │  │  • JSON output → HTTP → Falcosidekick             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Falcosidekick (2 replicas, HA)                     │  │   │
│  │  │  • Routes events to Loki + Prometheus + Alertmgr  │  │   │
│  │  │  • OTLP traces → Jaeger                            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│            │                                                      │
│            ▼                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  monitoring namespace                                     │   │
│  │  Prometheus ──► PrometheusRules ──► Alertmanager         │   │
│  │  Loki ◄──── Promtail (Falco log stream)                  │   │
│  │  Grafana ──► 9 Security Dashboards                       │   │
│  │  OTel Collector ──► Jaeger (traces)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## What Is Protected

| Workload | Protection Level | Key Threats Detected |
| :--- | :--- | :--- |
| `kcm-backend-api` | `CRITICAL` coverage | Shell, RCE, credential harvest, payment security |
| `kcm-backend-worker` | `CRITICAL` coverage | Crypto mining, token theft, unexpected processes |
| `kcm-backend-cron` | `HIGH` coverage | Crontab tampering, unexpected binaries, DB reset |
| `kcm-backend-socket` | `HIGH` coverage | Data exfiltration, reverse shells |
| `kcm-frontend` | `HIGH` coverage | Shell, unexpected writes, binary drift |
| **All K8s Resources** | `CRITICAL` coverage | Privileged pods, RBAC abuse, secrets access |
| **Nodes** | `CRITICAL` coverage | Container escape, kernel module load |

---

## Security Layers

```text
Layer 1: Admission Control    → Pod Security Admission (restricted/baseline/privileged)
Layer 2: Network Isolation    → NetworkPolicies on all namespaces
Layer 3: Runtime Detection    → Falco (kernel-level syscall monitoring via eBPF)
Layer 4: Alerting             → Prometheus + Alertmanager (4 severity tiers)
Layer 5: Logging              → Loki (immutable audit trail)
Layer 6: Tracing              → Jaeger via OTLP (incident forensics)
Layer 7: GitOps               → ArgoCD (all config version-controlled)
Layer 8: IaC                  → OpenTofu (infrastructure reproducible)
```

---

## Compliance Mapping

| Standard | Coverage |
| :--- | :--- |
| **CIS Kubernetes Benchmark** | 5.1.1–5.7.4 |
| **NIST CSF** | Detect (DE.CM), Respond (RS.AN) |
| **Pod Security Standards** | restricted (app pods), privileged (falco daemonset only) |
| **MITRE ATT&CK for Containers** | 15+ technique detections |

---

## Quick Reference

| Component | Location | Description |
| :--- | :--- | :--- |
| **Falco Helm Values** | [`platform/security/falco/helm/`](../../platform/security/falco/helm/) | Helm chart value overrides and daemonset configuration |
| **Custom Rules** | [`platform/security/falco/rules/`](../../platform/security/falco/rules/) | KCM-specific Falco threat detection rules |
| **Grafana Dashboards** | [`platform/security/falco/dashboards/`](../../platform/security/falco/dashboards/) | Pre-built threat visualization dashboards |
| **Prometheus Alerts** | [`platform/security/falco/alerts/`](../../platform/security/falco/alerts/) | Alertmanager alert rules for Falco events |
| **ArgoCD Applications** | [`kcm-church-infra/security/falco/`](../../kcm-church-infra/security/falco/) | GitOps deployment manifests for Falco stack |
| **OpenTofu Modules** | [`platform/opentofu/modules/`](../../platform/opentofu/modules/) | IaC modules for cloud and cluster security |
| **Incident Runbooks** | [Runbooks.md](Runbooks.md) | Operational containment & remediation runbooks |
| **Runbook Sources** | [`platform/security/falco/runbooks/`](../../platform/security/falco/runbooks/) | Detailed per-threat step-by-step procedure playbooks |
| **Documentation Root** | [`docs/security/`](./) | Security blueprint and policies |

---

## See Also

- [Runbooks.md](Runbooks.md) — Incident response runbooks index and MITRE mapping
- [Falco.md](Falco.md) — Installation and configuration
- [ThreatDetection.md](ThreatDetection.md) — Threat categories and detection
- [Rules.md](Rules.md) — Custom rule reference
- [Alerting.md](Alerting.md) — Alert routing and severity
- [IncidentResponse.md](IncidentResponse.md) — When an alert fires
- [Architecture.md](Architecture.md) — Full system architecture
- [Operations.md](Operations.md) — Cluster security operations and day-2 maintenance
- [Troubleshooting.md](Troubleshooting.md) — Diagnostics and debugging
- [Loki.md](Loki.md) — Security log aggregation and Promtail pipelines
- [Prometheus.md](Prometheus.md) — Metrics collection and alerting rules
