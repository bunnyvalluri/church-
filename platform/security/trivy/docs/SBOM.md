# Software Bill of Materials (SBOM) Documentation

## Overview
A Software Bill of Materials (SBOM) provides a complete, machine-readable inventory of software components, dependencies, licenses, and container layers for software supply chain security.

---

## 1. Supported Formats
1. **CycloneDX v1.5 JSON**: Industry-standard specification optimized for security analysis.
2. **SPDX v2.3 JSON**: Linux Foundation standard for license compliance and governance.

---

## 2. Automated Generation Pipeline
- **Release Automation**: Every production release tag in GitHub Actions generates CycloneDX & SPDX SBOM JSON files.
- **Cluster CronJob**: A daily Kubernetes CronJob in `trivy-system` generates updated SBOMs for all active cluster images.
