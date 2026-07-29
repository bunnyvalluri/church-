# GitOps Deployment Specification for Logging Platform

## Argo CD Application Integration
The logging platform is managed declaratively through Argo CD using the Application resource `platform/logging/kubernetes/argocd-logging-app.yaml`.

- **Sync Policy**: Automated with prune enabled and self-healing.
- **Server-Side Apply**: Enabled to handle large CRDs (ServiceMonitor, PrometheusRule).
- **Directory Structure**:
  - `platform/logging/helm/`: Umbrella Helm chart values.
  - `platform/logging/kubernetes/`: Namespace, RBAC, PVC, and Argo CD manifests.
