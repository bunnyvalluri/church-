# Trivy Security Scanner & SBOM Architecture

## Purpose
This document specifies the architecture, policies, and operational workflows for Trivy, the comprehensive security scanner used for container vulnerability assessment, Infrastructure-as-Code (IaC) auditing, secret detection, and Software Bill of Materials (SBOM) generation across the Kingdom of Christ Ministries platform.

## Scope
Covers Trivy Operator Kubernetes CRDs (`platform/security/trivy/operator/`), scan policies, GitHub Actions workflows, SBOM generation templates, and vulnerability triage runbooks.

## Status
> Status: Implemented

---

## 1. Trivy Scanning Architecture

```mermaid
graph TD
    subgraph CI/CD Stage (GitHub Actions)
        GitPush[Git Commit / PR] --> TrivyPRScan[Trivy PR Action Scanner]
        TrivyPRScan -->|Block on CRITICAL CVE| BlockPR[Block Merge Gate]
        TrivyPRScan -->|Pass| BuildImage[Build Multi-Arch Container]
        BuildImage --> TrivyImageScan[Trivy Image & SBOM Scan]
        TrivyImageScan -->|Generate CycloneDX / SPDX| SBOMArtifacts[Publish SBOM to Registry]
    end

    subgraph Kubernetes Runtime Stage (Trivy Operator)
        K8sDeploy[Container Pods in Cluster] --> TrivyOperator[Trivy Kubernetes Operator]
        TrivyOperator -->|Continuous Scan| VulnReports[VulnerabilityReports CRD]
        TrivyOperator -->|Scan Manifests| ConfigReports[ConfigAuditReports CRD]
        TrivyOperator -->|Scan Secrets| ExposedSecretReports[ExposedSecretReports CRD]
        
        VulnReports --> PrometheusExporter[Trivy Prometheus Metrics]
        PrometheusExporter --> GrafanaDashboard[Grafana Trivy Security Overview]
    end
```

---

## 2. Scan Policies & Standards

Defined in `platform/security/trivy/policies/`:

### 2.1 Image Vulnerability Policy (`trivy-scan-policy.yaml`)
- **Severity Threshold**: Builds are automatically failed if any unpatched **CRITICAL** or **HIGH** severity CVE is detected with an available vendor fix.
- **CVE Exceptions**: Any temporary vulnerability exceptions require an explicit expiration date and approval logged in `.trivyignore`.

### 2.2 Infrastructure-as-Code Policy (`iac-scan-policy.yaml`)
- Audits OpenTofu / Terraform scripts, Helm charts, and Kubernetes YAML manifests against CIS Kubernetes Benchmarks.
- Flags insecure configurations (e.g. pods running as root, missing CPU/memory resource limits, open ingress ports).

### 2.3 Secret Detection Policy (`secret-scan-policy.yaml`)
- Scans container layers and git repositories for committed API tokens (Cloudinary secrets, Firebase keys, Stripe secrets, private certificates).

---

## 3. SBOM (Software Bill of Materials) Generation

Trivy generates standardized SBOM artifacts during each CI/CD release build using templates in `platform/security/trivy/sbom/`:
- **CycloneDX JSON**: `cyclonedx-template.json` (Optimized for automated vulnerability correlation).
- **SPDX 2.3**: `spdx-template.json` (Optimized for enterprise compliance auditing).
- **Storage**: SBOM files are cryptographically signed using Cosign and published alongside container images in the GitHub Container Registry (GHCR).

---

## 4. Triage & Remediation Runbooks

Standard operational runbooks located in `platform/security/trivy/runbooks/`:
- `RUNBOOK_VULNERABILITY_TRIAGE.md`: 4-step triage workflow for addressing newly published CVEs.
- `RUNBOOK_SECRET_LEAK_RESPONSE.md`: Immediate key revocation and credential rotation checklist upon secret detection.
- `RUNBOOK_TRIVY_OPERATOR_MAINTENANCE.md`: Operator upgrade and database cache maintenance procedures.

---

## 5. Troubleshooting & Diagnostics

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `Trivy DB download rate limit exceeded` | GitHub API rate limiting on vulnerability database downloads | Configure `TRIVY_GITHUB_TOKEN` secret in CI/CD pipeline. |
| False positive on Node.js development package | Trivy scanning `devDependencies` inside production container | Ensure production Dockerfile uses multi-stage builds and `npm prune --production`. |

---

## Security Considerations
- Scans execute in isolated runner environments.
- Trivy database downloads use verified TLS endpoints with checksum validation.

## Related Documentation
- [Runtime-Security.md](Runtime-Security.md) — Kubernetes pod hardening.
- [Falco.md](Falco.md) — Runtime anomaly detection.
- [CI-CD.md](CI-CD.md) — Automated scanning pipelines.
