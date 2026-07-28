# Observability & Monitoring (`Monitoring.md`)

## Prometheus & Grafana Integration
Argo Rollouts exports metrics on port `8090` (and health on `8080`).
ServiceMonitor `argo-rollouts-metrics` in namespace `argo-rollouts` scrapes these metrics into Prometheus.

### Grafana Dashboard Features
- **Rollout Phase Summary**: Real-time status (Healthy, Progressing, Paused, Degraded).
- **Canary Weight Progression**: Visual timeline of traffic shifts.
- **Replica Health**: Active vs preview pod counts.
- **Analysis Metrics**: Success rate and latency graphs.

---
# Security Architecture (`Security.md`)

## Security Controls
- **RBAC**: Least-privilege roles for developers (`argo-rollouts-developer`) restricting write actions to rollout scaling and promotion.
- **Pod Security Standards**: Enforces `restricted` PSS profile (runAsNonRoot, drop ALL capabilities, readOnlyRootFilesystem).
- **NetworkPolicies**: Strict traffic isolation for canary and preview pods.
- **Admission Control**: Kyverno policies enforcing probes and analysis templates on all Rollout resources.

---
# GitHub Actions CI/CD (`GitHubActions.md`)

## Pipelines
1. `rollout-validate.yml`: Lints Helm charts and validates Rollout YAML via `kubeconform`.
2. `rollout-deploy.yml`: Scans images via Trivy, pushes to GHCR, updates GitOps Helm values, and monitors rollout promotion.
3. `rollout-test.yml`: Runs integration tests against the preview environment.

---
# Helm Integration Guide (`Helm.md`)

## Reusable Helm Chart (`platform/helm`)
Parameterizes Rollout creation with values:
- `strategy.type`: `canary` or `blueGreen`
- `analysis.enabled`: `true`
- `probes`: Startup, liveness, and readiness configurations.

---
# OpenTofu IaC Guide (`OpenTofu.md`)

## Modules (`platform/opentofu`)
Provisions Kubernetes namespace `argo-rollouts`, RBAC bindings, and the Argo Rollouts Helm release idempotently.
