# Trivy Core Documentation: KCM Security Platform

## Overview
**Trivy** (`aquasecurity/trivy`) is a comprehensive security scanner for container images, file systems, Git repositories, Kubernetes clusters, and IaC templates.

---

## 1. Scanner Engines Integrated

| Scanner Engine | Functionality | Target Assets |
| :--- | :--- | :--- |
| **Vulnerability Scanner** | Identifies OS package & language-specific library CVEs | Node.js, Alpine, Debian, Go, Java dependencies |
| **Config Audit Scanner** | Evaluates manifests against CIS benchmarks & OPA/Rego | K8s YAML, Helm charts, Dockerfiles, OpenTofu |
| **Secret Scanner** | Regex & entropy matching for leaked keys/tokens | Git history, environment files, ConfigMaps |
| **RBAC Assessment** | Analyzes cluster roles for privilege escalation risks | ClusterRoles, ServiceAccounts, RoleBindings |

---

## 2. CLI Execution Examples

### Image Vulnerability Scan
```bash
trivy image --severity CRITICAL,HIGH ghcr.io/kcm-church/kcm-portal:v1.4.2
```

### Infrastructure as Code Scan
```bash
trivy config platform/
```

### Secret Scan
```bash
trivy fs --security-checks secret .
```
