# GitOps Continuous Delivery via Argo CD

## Overview
All NATS components (Helm release, JetStream CRDs, Streams, Consumers, Monitoring, Alerts) are declaratively managed through Argo CD.

## Argo CD Application Setup
Application manifests are located at `platform/messaging/nats/argocd/nats-application.yaml`.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: kcm-nats-cluster
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/bunnyvalluri/church-.git'
    targetRevision: HEAD
    path: platform/messaging/nats/helm
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: messaging
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## GitOps Reconciliation Workflow
1. Developers update manifests in the Git repository (`platform/messaging/nats/`).
2. GitHub Actions runs CI checks (Helm linting, OpenTofu validation, JSON schema validation).
3. Argo CD detects repository drift and automatically syncs changes to the Kubernetes cluster within 3 minutes.
