# CloudNativePG Operator & Cluster Configuration Guide

## Overview
CloudNativePG is an open-source Kubernetes operator designed specifically for PostgreSQL workload management.

## Cluster Design Specifications
- **Version**: PostgreSQL 16.2
- **Topology**: 3 Instances (1 Primary, 2 Hot Standby Replicas)
- **Cluster Name**: `kcm-db-cluster`
- **Namespace**: `kcm-database`
- **Replication**: Physical Streaming Replication with WAL archiving.

## Engine Tuning Highlights
| Parameter | Value | Purpose |
|---|---|---|
| `shared_buffers` | `2GB` | Dedicated RAM buffer cache |
| `work_mem` | `32MB` | Per-operation query sorting memory |
| `maintenance_work_mem` | `512MB` | Autovacuum and index creation memory |
| `effective_cache_size` | `6GB` | Planner OS cache estimate |
| `max_connections` | `300` | Max direct database backends |
| `autovacuum_max_workers` | `4` | Concurrent vacuum workers |
