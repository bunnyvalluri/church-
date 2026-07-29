# NATS Observability & Prometheus Monitoring Manual

## Prometheus Exporter Sidecar Integration
The NATS cluster exposes metrics via `prometheus-nats-exporter` sidecar containers running on port `7777`.

## Prometheus Metrics Scraped

| Metric Name | Type | Description |
| :--- | :--- | :--- |
| `gnatsd_varz_connections` | Gauge | Active client connections |
| `gnatsd_varz_in_msgs` | Counter | Total inbound messages received |
| `gnatsd_varz_out_msgs` | Counter | Total outbound messages dispatched |
| `gnatsd_varz_slow_consumers` | Counter | Count of slow consumer dropped connection events |
| `gnatsd_varz_mem` | Gauge | Resident memory bytes used by NATS server |
| `gnatsd_jetstream_stream_messages` | Gauge | Total stored messages in JetStream stream |
| `gnatsd_jetstream_stream_bytes` | Gauge | Persistent disk storage used per stream |
| `gnatsd_jetstream_consumer_num_pending` | Gauge | Unacknowledged consumer backlog count |

## Grafana Dashboards
Dashboards are provisioned in Grafana via JSON manifests:
1. `NATS Cluster Performance & Health Overview` (`platform/messaging/nats/monitoring/grafana-nats-cluster.json`)
2. `NATS JetStream Persistence & Consumer Metrics` (`platform/messaging/nats/monitoring/grafana-jetstream-overview.json`)
