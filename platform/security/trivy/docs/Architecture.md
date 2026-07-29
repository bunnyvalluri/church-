# Architecture Documentation: KCM Trivy Enterprise Security Platform

## Overview
The Trivy Enterprise Security Platform provides end-to-end vulnerability scanning, IaC policy enforcement, secret detection, and automated SBOM generation across the Kingdom of Christ Ministries (KCM Church) platform stack.

---

## High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CI/CD PIPELINE                                   |
|                                                                                   |
|  [GitHub PR / Commit] ---> [Trivy Action FS / IaC] ---> [Upload SARIF to GitHub]  |
|                                         |                                         |
|                                [Block on Critical]                                |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                              KUBERNETES CLUSTER (GitOps)                          |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Namespace: trivy-system                                                     |  |
|  |                                                                             |  |
|  |  +-------------------+       +--------------------+       +--------------+  |  |
|  |  | Trivy Operator    | ----> | Vulnerability CRDs | ----> | Service      |  |  |
|  |  | Deployment (HA)   |       | & Config Reports   |       | Monitor      |  |  |
|  |  +-------------------+       +--------------------+       +--------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                         |         |
+-------------------------------------------------------------------------|---------+
                                                                          v
+-----------------------------------------------------------------------------------+
|                             OBSERVABILITY & ALERTING                              |
|                                                                                   |
|           [Prometheus Metrics] --------> [Grafana Dashboard]                      |
|                    |                                                              |
|                    v                                                              |
|        [PrometheusAlertManager] --------> [PagerDuty / Slack Alert]               |
+-----------------------------------------------------------------------------------+
```

---

## Core Architecture Principles
1. **Zero External Modifications**: Built 100% using official release artifacts from `aquasecurity/trivy` and `trivy-operator`.
2. **Shift-Left & Continuous Enforcement**: Scans occur early at PR time in GitHub Actions and continuously at runtime via Kubernetes Trivy Operator.
3. **GitOps & IaC Control**: All policies, operator configurations, and Prometheus rules are versioned in Git and applied via Argo CD and OpenTofu.
