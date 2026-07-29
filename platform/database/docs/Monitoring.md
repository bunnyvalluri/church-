# Database Observability & Monitoring

## Stack Integration
- **Metrics Exporter**: Native CloudNativePG metric server on TCP port 9187.
- **Prometheus Scraper**: `PodMonitor` `cnpg-cluster-pod-monitor`.
- **Visualization**: Grafana dashboard `cnpg-enterprise-kcm`.
