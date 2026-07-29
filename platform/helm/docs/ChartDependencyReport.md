# Chart Dependency Report - Kingdom of Christ Ministries (KCM Church)

## 1. Overview
This document maps the complete dependency matrix across all 15 Helm charts in the KCM Church platform.

---

## 2. Dependency Matrix

| Application Chart | Dependent Subcharts / Infrastructure Services | Registry / Source | Dependency Type | Condition / Toggle |
| :--- | :--- | :--- | :--- | :--- |
| **`nextjs`** | `backend` (API backend) | `oci://ghcr.io/.../backend` | Service Dependency | Standard HTTP API |
| **`backend`** | `cloudnativepg`, `redis`, `kafka`, `nats` | `oci://ghcr.io/.../charts` | Subchart / Remote | `cloudnativepg.enabled`, `redis.enabled` |
| **`cloudnativepg`** | `longhorn` (StorageClass) | `oci://ghcr.io/.../longhorn` | Storage Provisioner | PersistentVolumeClaim (`longhorn-crypto`) |
| **`redis`** | `longhorn` (StorageClass) | Local / OCI | Storage Provisioner | PVC binding |
| **`kafka`** | `longhorn` (StorageClass) | Local / OCI | Storage Provisioner | PVC binding |
| **`nats`** | `longhorn` (StorageClass) | Local / OCI | Storage Provisioner | PVC binding |
| **`istio`** | Envoy Gateway / Cert-Manager | Local / OCI | Service Mesh | Service entry / VirtualService |
| **`grafana`** | `prometheus`, `loki`, `jaeger` | Local / OCI | Telemetry Datasources | `datasources.prometheus.enabled` |
| **`prometheus`** | All application charts | Local / OCI | Metrics Scraper | `ServiceMonitor` CRDs |
| **`loki`** | `longhorn` (StorageClass) | Local / OCI | Storage & Log Aggregation | PVC binding |
| **`velero`** | S3 Cloud Storage / Longhorn | Local / OCI | Backup & DR | `velero.backupStorageLocation` |
| **`argocd`** | All platform charts | `oci://ghcr.io/.../argocd` | GitOps Engine | Root ApplicationSet |

---

## 3. Helm Dependency Management Workflow

To update chart dependencies in local development:

```bash
# Update chart dependencies from Chart.yaml
helm dependency update platform/helm/charts/backend

# Build local dependency charts cache
helm dependency build platform/helm/charts/backend

# List chart dependencies
helm dependency list platform/helm/charts/backend
```
