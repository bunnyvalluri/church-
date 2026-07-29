# Observability: Monitoring, Dashboards & Tracing

## Monitoring Stack Integration
- **Prometheus JMX Exporter**: Exposes broker runtime JVM, Controller state, Network throughput, and Log metrics on port 9308.
- **ServiceMonitor**: `servicemonitor-kafka.yaml` automates Prometheus target discovery.
- **Grafana Dashboards**:
  - `KCM Kafka Cluster Overview`: Active Controllers, Under-replicated partitions, Bytes In/Out, Storage.
  - `KCM Kafka Consumer Lag & Performance`: Consumer Group Lag, Fetch Latency, Partition Offsets.
- **OpenTelemetry & Jaeger**: `opentelemetry-kafka-collector.yaml` receives OTLP traces and forwards them to Jaeger.
