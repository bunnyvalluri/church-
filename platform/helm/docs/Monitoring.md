# Helm Release Monitoring & Telemetry Guide

## 1. Prometheus Telemetry
- All application charts configure `ServiceMonitor` resources scraping `/metrics` endpoints.
- Grafana Loki collects stdout/stderr logs from all Helm release pods.
- Jaeger collects OpenTelemetry trace spans.
