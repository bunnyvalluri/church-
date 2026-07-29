# GitOps Deployment Architecture with Argo CD

## GitOps Workflow
All Kafka infrastructure, topic definitions, monitoring dashboards, and security rules are managed declaratively in Git and synchronized via Argo CD applications:

1. `argocd-kafka-cluster.yaml`: Manages the Kafka Helm chart deployment in KRaft mode.
2. `argocd-kafka-topics.yaml`: Manages topic definitions, provisioner jobs, and ACL ConfigMaps.
3. `argocd-kafka-monitoring.yaml`: Manages ServiceMonitors, Grafana Dashboards, and PrometheusRules.

## Automated Reconciliation
Argo CD continuously compares git state against cluster state, automatically healing drift (`selfHeal: true`) and pruning deleted resources (`prune: true`).
