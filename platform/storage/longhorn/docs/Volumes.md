# Persistent Volumes & Sizing Policy

## Workload Sizing Matrix

```
Workload          Namespace    StorageClass           Initial Size  Expansion Supported
----------------------------------------------------------------------------------------
CloudNativePG     database     longhorn-cloudnativepg 100Gi         Yes (Online)
PgBouncer         database     longhorn-fast          10Gi          Yes (Online)
Redis Cache       cache        longhorn-redis         20Gi          Yes (Online)
Grafana Loki      logging      longhorn-loki          150Gi         Yes (Online)
Grafana UI        monitoring   longhorn-replicated    20Gi          Yes (Online)
Prometheus TSDB   monitoring   longhorn-fast          200Gi         Yes (Online)
Jaeger Tracing    monitoring   longhorn-single-replica 50Gi          Yes (Online)
App Workloads     default      longhorn-replicated    50Gi          Yes (Online)
Upload Services   default      longhorn-replicated    100Gi (RWX)   Yes (Online)
Media Processor   default      longhorn-fast          250Gi         Yes (Online)
```

---

## Access Modes Supported
- **ReadWriteOnce (RWO)**: Standard block storage mounted by single node/pod (CloudNativePG, Redis, Prometheus).
- **ReadWriteMany (RWX)**: Shared file system mounted simultaneously by multiple application replicas via Longhorn Share Manager (Upload Services).
