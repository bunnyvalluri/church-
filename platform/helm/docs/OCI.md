# OCI Registry Integration & Management Guide

## 1. Overview
All KCM Church Helm charts are packaged and published to GitHub Container Registry as OCI v1 artifacts:

`oci://ghcr.io/bunnyvalluri/church-/charts/<chart-name>:<version>`

---

## 2. Authentication & Packaging Commands
```bash
# Login to GHCR OCI
echo $GHCR_PAT | helm registry login ghcr.io -u bunnyvalluri --password-stdin

# Package Chart
helm package platform/helm/charts/nextjs --destination .cr-release-packages

# Push Chart to OCI Registry
helm push .cr-release-packages/nextjs-1.2.0.tgz oci://ghcr.io/bunnyvalluri/church-/charts

# Inspect Remote OCI Manifest
helm show chart oci://ghcr.io/bunnyvalluri/church-/charts/nextjs --version 1.2.0
```
