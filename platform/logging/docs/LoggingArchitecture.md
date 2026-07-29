# KCM Platform Enterprise Logging Architecture

## Overview
The Kingdom of Christ Ministries (KCM Church) Enterprise Logging Platform provides centralized, secure, highly available, and observable log aggregation for every application, security layer, database instance, network gateway, and infrastructure component across the Kubernetes environment.

```
+-----------------------------------------------------------------------------------+
|                                  LOG SOURCES                                      |
|  +----------------+  +-------------------+  +------------------+  +------------+  |
|  | Node.js / API  |  | Next.js Frontend  |  | Envoy Gateway    |  | CNPG DB    |  |
|  +-------+--------+  +---------+---------+  +--------+---------+  +-----+------+  |
|          |                     |                   |                |             |
|  +-------+--------+  +---------+---------+  +--------+---------+      |             |
|  | Redis / Worker |  | Falco Security    |  | K8s System Logs  |      |             |
|  +-------+--------+  +---------+---------+  +--------+---------+      |             |
+----------|---------------------|-------------------|----------------|-------------+
           |                     |                   |                |
           +---------------------+---------+---------+----------------+
                                           |
                                           v
                        +------------------------------------+
                        |  Grafana Alloy Collector DaemonSet |
                        |  (CRI, JSON Parse, Labels, Drop)   |
                        +------------------+-----------------+
                                           | Push (HTTP/JSON)
                                           v
                        +------------------------------------+
                        |       Loki Gateway Service         |
                        +------------------+-----------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
        +-----------------------+                     +-----------------------+
        |  Loki Write Replicas  |                     |   Loki Read Replicas  |
        |  (Ingesters, TSDB)    |                     |   (Queriers, Splitting) |
        +-----------+-----------+                     +-----------+-----------+
                    |                                             |
                    +----------------------+----------------------+
                                           |
                                           v
                        +------------------------------------+
                        | S3 / Object Store (Chunks & Index) |
                        +------------------------------------+
```

## Key Capabilities
- **Multi-Tenant Stream Aggregation**: Log streams labeled by `namespace`, `app`, `container`, `service`, `level`, and `correlation_id`.
- **Zero-Modification Loki Integration**: Uses official `grafana/loki` releases and official Helm charts without forks.
- **Trace Context Propagation**: W3C `traceparent` headers mapped directly to Grafana Loki logs for seamless Log-to-Trace cross-linking.
- **GitOps Managed**: Deployed via Argo CD with continuous validation via GitHub Actions.
