# Container & Infrastructure Security Best Practices

## Guidelines & Principles

### 1. Official Repository Enforcement
- Always pull official, signed release artifacts from `aquasecurity/trivy` and `aquasecurity/trivy-operator`.
- Never fork or modify core Trivy code.

### 2. Shift-Left Security
- Run Trivy checks in local developer environments using pre-commit hooks.
- Block Pull Requests failing `CRITICAL` or `HIGH` severity gates.

### 3. Continuous Runtime Monitoring
- Use Trivy Operator in Kubernetes for continuous scanning.
- Integrate Prometheus alerts for real-time notification of emerging CVEs.

### 4. Supply Chain Integrity
- Produce CycloneDX and SPDX format SBOMs for all release artifacts.
- Enforce immutable image tags (`v1.4.2` rather than `latest`).
