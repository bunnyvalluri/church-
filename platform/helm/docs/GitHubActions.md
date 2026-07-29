# GitHub Actions CI/CD Pipeline Guide

## 1. Workflows

1. **`helm-ci.yml`**:
   - Triggers on PR/push to `main` or `develop`.
   - Runs `chart-testing` (`ct lint`), `helm lint`, and `helm template` syntax validation.

2. **`helm-publish-oci.yml`**:
   - Triggers on tag release (`v*.*.*`).
   - Packages charts, authenticates to GHCR OCI, signs with Cosign, and publishes OCI artifacts.
