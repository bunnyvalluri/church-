# Runtime Security — Kingdom of Christ Ministries

## Overview

The KCM Church Portal implements an **Enterprise Runtime Security Platform** powered by **Falco**, the industry-standard open-source cloud-native runtime threat detection engine. This platform provides real-time visibility into everything happening inside the Kubernetes cluster, at the kernel system-call level.

---

## Architecture

```
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
|---|---|---|
| `kcm-backend-api` | CRITICAL coverage | Shell, RCE, credential harvest, payment security |
| `kcm-backend-worker` | CRITICAL coverage | Crypto mining, token theft, unexpected processes |
| `kcm-backend-cron` | HIGH coverage | Crontab tampering, unexpected binaries, DB reset |
| `kcm-backend-socket` | HIGH coverage | Data exfiltration, reverse shells |
| `kcm-frontend` | HIGH coverage | Shell, unexpected writes, binary drift |
| All K8s resources | CRITICAL coverage | Privileged pods, RBAC abuse, secrets access |
| Nodes | CRITICAL coverage | Container escape, kernel module load |

---

## Security Layers

```
Layer 1: Admission Control    → Pod Security Admission (restricted/baseline/privileged)
Layer 2: Network Isolation    → NetworkPolicies on all namespaces
Layer 3: Runtime Detection    → Falco (kernel-level syscall monitoring)
Layer 4: Alerting             → Prometheus + Alertmanager (4 severity tiers)
Layer 5: Logging              → Loki (immutable audit trail)
Layer 6: Tracing              → Jaeger via OTLP (incident forensics)
Layer 7: GitOps               → ArgoCD (all config version-controlled)
Layer 8: IaC                  → OpenTofu (infrastructure reproducible)
```

---

## Compliance Mapping

| Standard | Coverage |
|---|---|
| CIS Kubernetes Benchmark | 5.1.1–5.7.4 |
| NIST CSF | Detect (DE.CM), Respond (RS.AN) |
| Pod Security Standards | restricted (app), privileged (falco only) |
| MITRE ATT&CK for Containers | 15+ technique detections |

---

## Quick Reference

| Component | Location |
|---|---|
| Falco Helm values | `platform/security/falco/helm/` |
| Custom rules | `platform/security/falco/rules/` |
| Grafana dashboards | `platform/security/falco/dashboards/` |
| Prometheus alerts | `platform/security/falco/alerts/` |
| ArgoCD applications | `kcm-church-infra/security/falco/` |
| OpenTofu modules | `platform/opentofu/modules/falco*/` |
| Runbooks | `platform/security/falco/runbooks/` |
| Documentation | `docs/security/` |

---

## See Also

- [Falco.md](Falco.md) — Installation and configuration
- [ThreatDetection.md](ThreatDetection.md) — Threat categories and detection
- [Rules.md](Rules.md) — Custom rule reference
- [Alerting.md](Alerting.md) — Alert routing and severity
- [IncidentResponse.md](IncidentResponse.md) — When an alert fires
- [Architecture.md](Architecture.md) — Full system architecture
