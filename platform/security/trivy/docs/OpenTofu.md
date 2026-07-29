# OpenTofu Provisioning Documentation

## Overview
Infrastructure as Code (IaC) provisioning for Trivy Operator and associated cluster resources is managed via OpenTofu modules in `platform/security/trivy/opentofu/`.

---

## 1. Module Structure
- `main.tf`: Defines `kubernetes_namespace_v1` and `helm_release` resources.
- `variables.tf`: Input variables for namespace name, chart version, severity levels, and monitoring toggles.
- `outputs.tf`: Exports namespace name and Helm deployment status.
- `providers.tf`: Configures Kubernetes and Helm providers.

---

## 2. Command Execution
```bash
cd platform/security/trivy/opentofu
tofu init
tofu plan
tofu apply -auto-approve
```
