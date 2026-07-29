# Architecture — Enterprise Runtime Security Platform
## Kingdom of Christ Ministries

## System Architecture

```
═══════════════════════════════════════════════════════════════════
          KCM Enterprise Runtime Security Platform
═══════════════════════════════════════════════════════════════════

  CONTROL PLANE
  ┌─────────────────────────────────────────────────────────────┐
  │  GitHub (kcm-church-infra)                                  │
  │  ├── platform/security/falco/  (rules, helm, dashboards)   │
  │  └── kcm-church-infra/security/ (ArgoCD apps)              │
  └───────────────────────────────┬─────────────────────────────┘
                                  │ GitOps (push)
                                  ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  ArgoCD (argocd namespace)                                  │
  │  ├── App: falco-kubernetes   (wave 0 — RBAC, NS, NetPol)   │
  │  ├── App: falco              (wave 1 — Helm DaemonSet)      │
  │  ├── App: falco-rules        (wave 1 — Custom rules CM)     │
  │  └── App: falco-monitoring   (wave 2 — Dashboards, Rules)  │
  └───────────────────────────────┬─────────────────────────────┘
                                  │ deploys
                                  ▼
  DATA PLANE
  ┌─────────────────────────────────────────────────────────────┐
  │  falco namespace                                            │
  │                                                             │
  │  Node 1          Node 2          Node N                     │
  │  ┌──────┐        ┌──────┐        ┌──────┐                  │
  │  │Falco │        │Falco │        │Falco │                  │
  │  │eBPF  │        │eBPF  │        │eBPF  │                  │
  │  └──┬───┘        └──┬───┘        └──┬───┘                  │
  │     │              │               │                        │
  │     └──────────────┴───────────────┘                        │
  │                        │ HTTP/JSON events                    │
  │                        ▼                                    │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │  Falcosidekick (2 replicas, HA)                       │  │
  │  │  Input: Falco events                                  │  │
  │  │  Output:                                              │  │
  │  │    ├── Loki   (logs)     port 3100                   │  │
  │  │    ├── Prometheus (metrics) port 2802/metrics         │  │
  │  │    ├── Alertmanager       port 9093                   │  │
  │  │    └── OTLP Collector     port 4317                   │  │
  │  └───────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
  OBSERVABILITY
  ┌─────────────────────────────────────────────────────────────┐
  │  monitoring namespace                                       │
  │                                                             │
  │  ┌───────────┐   ┌───────────┐   ┌────────────────────┐   │
  │  │Prometheus │   │   Loki    │   │  Alertmanager       │   │
  │  │           │   │           │   │                     │   │
  │  │ Scrapes   │   │ Receives  │   │ Routes:             │   │
  │  │ Falcosick │   │ Falco     │   │  CRITICAL → webhook │   │
  │  │ metrics   │   │ JSON logs │   │  HIGH → webhook     │   │
  │  │           │   │ via       │   │  WARNING → webhook  │   │
  │  │ PromeRule │   │ Promtail  │   │                     │   │
  │  └─────┬─────┘   └─────┬─────┘   └─────────────────────┘  │
  │        │               │                                    │
  │        └───────┬────────┘                                   │
  │                ▼                                            │
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │  Grafana — 9 Security Dashboards                     │  │
  │  │  ├── Security Overview                               │  │
  │  │  ├── Falco Events                                    │  │
  │  │  ├── Container Threats                               │  │
  │  │  ├── Pod Security                                    │  │
  │  │  ├── Node Security                                   │  │
  │  │  ├── Namespace Security                              │  │
  │  │  ├── RBAC Events                                     │  │
  │  │  ├── Runtime Attacks                                 │  │
  │  │  └── Threat Timeline                                 │  │
  │  └──────────────────────────────────────────────────────┘  │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │  OTel Collector → Jaeger (HIGH/CRITICAL traces)      │  │
  │  └──────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility |
|---|---|
| **Falco DaemonSet** | Kernel-level syscall monitoring on every node |
| **Falcosidekick** | Event routing: Falco → Loki, Prometheus, Alertmanager, OTLP |
| **Promtail (Falco)** | Reads Falco JSON log file → pushes to Loki as structured logs |
| **PrometheusRule** | Defines alert thresholds for all 4 severity tiers |
| **AlertmanagerConfig** | Routes alerts by severity with inhibition rules |
| **Grafana ConfigMaps** | Auto-provisions 9 security dashboards |
| **OTel Collector** | Converts HIGH/CRITICAL Falco events to distributed traces |
| **ArgoCD** | GitOps management of all above components |
| **OpenTofu** | Infrastructure as Code for Helm releases + RBAC + networking |
| **GitHub Actions** | CI: validate rules, lint Helm, validate OpenTofu, security scan |

## Data Flow

```
Kernel syscall
    → eBPF probe intercepts
    → Falco rules engine evaluates
    → if matched → JSON event output
    → HTTP POST to Falcosidekick:2801
    → Falcosidekick fans out:
        ├── Loki: structured log entry {app="falco", priority=..., rule=...}
        ├── Prometheus: counter falcosidekick_falco_events_total{priority, rule}
        ├── Alertmanager: alert if priority >= WARNING
        └── OTLP: trace span if priority >= HIGH
```
