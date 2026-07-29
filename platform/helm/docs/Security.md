# DevSecOps & Helm Security Hardening Guide

## 1. Security Controls

- **Cosign Digital Signatures**: All published OCI chart packages are cryptographically signed.
- **Pod Security Standard**: Pod templates enforce `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, and drop `ALL` capabilities.
- **Continuous Vulnerability Scanning**: Trivy Operator scans rendered manifests for CVEs.
- **Runtime Security**: Falco eBPF driver traces container syscalls for anomalous activity.
