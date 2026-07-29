# Storage Platform Monitoring Architecture

## Metrics Collection Pipeline
1. **Longhorn Manager Metrics Engine**: Exposes `/metrics` endpoint on port `9500`.
2. **ServiceMonitor Integration**: `longhorn-prometheus-servicemonitor` automatically scrapes Longhorn metrics every 15 seconds.
3. **Prometheus Stack**: Stores metric time-series data.
4. **Grafana Dashboards**: Visualizes storage performance and capacity.

---

## Core Longhorn Prometheus Metrics
- `longhorn_volume_robustness`: Volume state (1 = Healthy, 2 = Degraded, 3 = Faulted).
- `longhorn_node_storage_capacity_bytes`: Total storage capacity per node.
- `longhorn_node_storage_usage_bytes`: Utilized storage bytes per node.
- `longhorn_volume_read_ops_total` / `longhorn_volume_write_ops_total`: Read/Write IOPS.
- `longhorn_volume_read_throughput_bytes_total` / `longhorn_volume_write_throughput_bytes_total`: Throughput.
- `longhorn_volume_read_latency_seconds` / `longhorn_volume_write_latency_seconds`: IO Latency.
