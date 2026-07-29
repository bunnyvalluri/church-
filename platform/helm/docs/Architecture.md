# Enterprise Helm Architecture Guide - KCM Church

## 1. Overview
The Kingdom of Christ Ministries (KCM Church) Enterprise Helm Package Management Platform provides an immutable, GitOps-driven, OCI-based package lifecycle system across 16 microservices and infrastructure operators.

```
+-----------------------------------------------------------------------+
|                            Git Repository                             |
|              (https://github.com/bunnyvalluri/church-.git)           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      GitHub Actions CI/CD Pipeline                    |
|             (helm-ci.yml & helm-publish-oci.yml + Cosign)             |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    GitHub Container Registry (GHCR OCI)               |
|            oci://ghcr.io/bunnyvalluri/church-/charts/<chart>           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         Argo CD GitOps Engine                         |
|             ApplicationSet & Automated Self-Healing Sync              |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       Target Kubernetes Cluster                       |
|  [Frontend] [Backend] [Databases] [Messaging] [Storage] [Telemetry]   |
+-----------------------------------------------------------------------+
```

---

## 2. Core Architectural Pillars
- **Zero Modifications to Helm**: Built entirely on standard Helm 3 CLI and official OCI specification.
- **GitOps SSOT**: Argo CD acts as the single source of truth for all environment state.
- **DevSecOps Integration**: Cryptographically signed OCI artifacts (Cosign) and continuous vulnerability scans (Trivy + Falco).
