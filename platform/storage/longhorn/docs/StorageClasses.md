# StorageClasses Architecture & Reference

| StorageClass Name | Replicas | Locality | Reclaim Policy | Primary Target Workloads |
|---|---|---|---|---|
| `longhorn-replicated` | 3 | best-effort | Delete | Default HA Workloads, Grafana, App Services |
| `longhorn-fast` | 3 | best-effort | Delete | High-IOPS NVMe, Prometheus, PgBouncer |
| `longhorn-cloudnativepg` | 3 | strict-local | Retain | CloudNativePG PostgreSQL Clusters |
| `longhorn-redis` | 2 | best-effort | Delete | Redis In-Memory Cache |
| `longhorn-loki` | 2 | best-effort | Retain | Grafana Loki Log Storage |
| `longhorn-single-replica` | 1 | best-effort | Delete | Jaeger Traces, Temporary Scratch Files |
| `longhorn-crypto` | 3 | best-effort | Delete | LUKS-Encrypted Volumes (Secrets, PII) |

---

## Detailed Specifications

### `longhorn-cloudnativepg`
Optimized for transactional database performance. Uses `strict-local` data locality so the active database pod reads and writes directly to local NVMe storage without traversing the network overlay, while maintaining 2 remote async/sync node replicas for failover.
