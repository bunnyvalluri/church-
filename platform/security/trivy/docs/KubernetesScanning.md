# Kubernetes Workload & RBAC Scanning Documentation

## Overview
Continuous cluster scanning is managed by **Trivy Operator** running in `trivy-system` namespace. It automatically audits running pods, deployments, statefulsets, daemonsets, roles, and network policies.

---

## 1. Scanned Kubernetes Resource Types

```
Kubernetes API Server
     |
     +--> Pods / Deployments ----> VulnerabilityReports
     +--> ConfigMaps / Services --> ConfigAuditReports
     +--> ClusterRoles / RBAC ----> RbacAssessmentReports
     +--> Secrets --------------> ExposedSecretReports
```

---

## 2. Resource & Namespace Isolation
- **Target Namespaces**: `default`, `kcm-apps`, `database`, `messaging`, `gateway`, `storage`, `logging`, `monitoring`.
- **Excluded Namespaces**: `kube-system` (to reduce control plane noise).
- **Scan Interval**: Workload vulnerability scans execute every 6 hours; Config and RBAC audits execute every 12 hours.
