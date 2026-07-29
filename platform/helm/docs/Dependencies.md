# Helm Dependencies & Version Pinning Guide

## 1. Dependency Resolution Rules
- Application subcharts use explicit local references (`repository: file://../<chart>`) or pinned OCI references (`repository: oci://ghcr.io/...`).
- Conditions control subchart enablement (e.g., `condition: redis.enabled`).
- Explicit semantic versioning (`^x.y.z`) prevents unintentional breaking upgrades.

---

## 2. Managing Dependencies
```bash
# Update dependencies from Chart.yaml
helm dependency update platform/helm/charts/backend

# Verify dependencies
helm dependency list platform/helm/charts/backend
```
