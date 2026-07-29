# Infrastructure as Code (IaC) Scanning Documentation

## Overview
IaC scanning detects security misconfigurations, missing resource limits, privilege escalation risks, and non-compliance with the CIS Kubernetes Benchmark before infrastructure is applied.

---

## 1. Supported IaC Formats & Frameworks
- **OpenTofu Modules** (`platform/opentofu/`, `platform/security/trivy/opentofu/`)
- **Helm Charts** (`platform/helm/`, `platform/security/trivy/helm/`)
- **Kubernetes Manifests** (`platform/kubernetes/`, `platform/security/trivy/operator/`)
- **Dockerfiles** (`Dockerfile`, `Dockerfile.prod`)
- **GitHub Actions Workflows** (`.github/workflows/`)

---

## 2. Key Misconfigurations Prevented

| Rule ID | Severity | Description | Remediation |
| :--- | :--- | :--- | :--- |
| **KSV001** | HIGH | Process can elevate privileges | Set `allowPrivilegeEscalation: false` |
| **KSV012** | HIGH | Container running as root | Enforce `runAsNonRoot: true` |
| **KSV014** | MEDIUM | Root file system is writable | Set `readOnlyRootFilesystem: true` |
| **KSV021** | MEDIUM | Capabilities not dropped | Add `capabilities: { drop: ["ALL"] }` |
