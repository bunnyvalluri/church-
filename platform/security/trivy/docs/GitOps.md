# GitOps Management Documentation

## Overview
The entire Trivy security stack—including Trivy Operator, security policies, custom CRDs, and monitoring configs—is managed declaratively through **Argo CD**.

---

## 1. Argo CD Resources
- `application-trivy-operator.yaml`: Deploys trivy-operator Helm chart from official Aqua Security Helm repository.
- `application-trivy-policies.yaml`: Syncs custom Rego policies and secret detection rules from the Git repository.
- `applicationset-trivy.yaml`: Multi-cluster deployment template.

---

## 2. Sync & Automated Drift Remediation
`syncPolicy.automated` with `prune: true` and `selfHeal: true` ensures any manual cluster mutations are immediately corrected to match Git state.
