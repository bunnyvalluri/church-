# Enterprise Longhorn Storage Platform Architecture

## Executive Architecture Summary
The Kingdom of Christ Ministries (KCM Church) Enterprise Storage Platform is built on official, un-forked Longhorn block storage (CNCF Incubating project). Longhorn turns local node block storage (NVMe/SSD) into highly available, distributed, synchronous block storage for Kubernetes stateful workloads.

---

## Architectural Principles
1. **Zero Single Point of Failure**: Synchronous 3-way volume replication across physical nodes and availability zones.
2. **Microservices Storage Architecture**: Dedicated Longhorn Engine process per volume, eliminating blast radiuses from controller crashes.
3. **Decoupled Control & Data Planes**: Longhorn Manager controls orchestration while lightweight Instance Managers handle high-performance block IO.
4. **GitOps & IaC Native**: 100% of storage configurations, StorageClasses, and backup schedules declared via OpenTofu and managed by Argo CD.

---

## High Level Architecture Diagram
```
                     +---------------------------------------+
                     |         Envoy Gateway / Ingress       |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |          Longhorn UI / API            |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |           Longhorn Manager            |
                     |   (CSI Plugin & Admission Webhook)    |
                     +---------------------------------------+
                                         |
                 +-----------------------+-----------------------+
                 |                       |                       |
                 v                       v                       v
          +--------------+        +--------------+        +--------------+
          | Node 1 Engine|        | Node 2 Engine|        | Node 3 Engine|
          +--------------+        +--------------+        +--------------+
          | Replica 1    | <----> | Replica 2    | <----> | Replica 3    |
          | (NVMe/SSD)   | Sync   | (NVMe/SSD)   | Sync   | (NVMe/SSD)   |
          +--------------+        +--------------+        +--------------+
```

---

## Storage Class Allocation Strategy
- **CloudNativePG PostgreSQL**: `longhorn-cloudnativepg` (Strict data locality, 3x replication, NVMe preferred).
- **Redis Cache**: `longhorn-redis` (Low latency, 2x replication).
- **Loki Log Chunks**: `longhorn-loki` (High throughput, 2x replication, retained).
- **General Workloads**: `longhorn-replicated` (3x replication, auto-balanced).
- **Scratch / Temporary**: `longhorn-single-replica` (1x replication for transient pods).
