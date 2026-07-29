# Grafana Loki Platform Specification

## Component Topology
The Loki deployment uses **SimpleScalable / Distributed Mode** to guarantee high availability and scalable throughput:

| Component | Replicas | Role | Resource Requests | Resource Limits |
| :--- | :---: | :--- | :--- | :--- |
| **Write (Ingester)** | 3 | Ingests log streams, builds TSDB chunks | 1 CPU / 2Gi RAM | 4 CPU / 8Gi RAM |
| **Read (Querier)** | 3 | Executes LogQL queries with split-by-interval | 500m CPU / 1Gi RAM | 2 CPU / 4Gi RAM |
| **Backend (Compactor/Ruler)** | 2 | Compactor, stream retention, Loki alert evaluation | 500m CPU / 2Gi RAM | 2 CPU / 4Gi RAM |
| **Gateway** | 2 | NGINX/Envoy reverse proxy for Loki HTTP API | 100m CPU / 128Mi RAM | 500m CPU / 512Mi RAM |

## Configuration Highlights
- **Schema**: TSDB `v13` with 24h index period.
- **Chunk Encoding**: `snappy` compression.
- **Limits**: Maximum line size `256KB`, stream rate limit `10MB/s` with `20MB` burst.
