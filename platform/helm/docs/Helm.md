# Helm 3 Standards & CLI Operations Guide

## 1. Official Helm 3 Integration
This platform is built using official Helm v3.15.2 binaries. It strictly adheres to:
- Chart API Version 2 (`apiVersion: v2`)
- Helm 3 OCI registry specification (`helm push` / `helm pull` with `oci://` scheme)
- Go Template functions (`sprig` library) and standard helper conventions (`_helpers.tpl`)

---

## 2. Essential Commands

### Install / Upgrade Chart
```bash
helm upgrade --install nextjs platform/helm/charts/nextjs \
  -f platform/helm/charts/nextjs/values-production.yaml \
  --namespace kcm-production --create-namespace
```

### Dependency Sync
```bash
helm dependency update platform/helm/charts/backend
```

### Template Debugging
```bash
helm template test-release platform/helm/charts/backend --debug
```
