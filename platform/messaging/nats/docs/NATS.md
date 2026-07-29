# NATS Core Server Configuration & Operating Manual

## Overview
This document details the configuration and operational setup of the official `nats-server` deployment for Kingdom of Christ Ministries.

## Server Deployment Specs
- **Official Image**: `nats:2.10.18-alpine`
- **Cluster Topology**: 3 Nodes deployed via Kubernetes StatefulSet
- **Port Allocations**:
  - `4222`: Client connections (TLS 1.3 encrypted)
  - `6222`: Cluster route communication between NATS nodes
  - `8222`: HTTP Monitoring & Health checks (`/varz`, `/connz`, `/jsz`)
  - `7777`: Prometheus Exporter metrics endpoint

## Server Startup & Configuration
NATS is configured via declarative Helm values located at `platform/messaging/nats/helm/values.yaml`.

Key settings:
- `cluster.name`: `kcm-nats-cluster`
- `max_payload`: `10485760` (10 MB)
- `ping_interval`: `10s`
- `max_ping_out`: `3`

## Health Verification Commands
```bash
# Check Server Health via HTTP endpoint
kubectl exec -it nats-0 -n messaging -- curl http://localhost:8222/varz

# Verify Active Connections
kubectl exec -it nats-0 -n messaging -- curl http://localhost:8222/connz
```
