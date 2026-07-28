# Monitoring — KCM Church Gateway Platform

## Metrics Stack

| Component | Tool |
|---|---|
| Metrics collection | Prometheus |
| Visualization | Grafana |
| Log aggregation | Loki |
| Distributed tracing | OpenTelemetry + Grafana Tempo |
| Alerting | Alertmanager |

## Grafana Dashboard

**Dashboard:** `KCM — Envoy Gateway Metrics` (uid: `kcm-envoy-gateway`)

**Import:** `platform/gateway/monitoring/grafana-dashboard-gateway.json`

**Panels:**
| Panel | Metric | Threshold |
|---|---|---|
| Requests/sec | `envoy_cluster_upstream_rq_total` | Warning: >1000, Critical: >5000 |
| Error Rate | 5xx / total | Warning: >1%, Critical: >5% |
| P99 Latency | `histogram_quantile(0.99, ...)` | Warning: >500ms, Critical: >2s |
| Active Connections | `envoy_listener_downstream_cx_active` | Warning: >5000 |
| Rate Limited (429) | `envoy_cluster_upstream_rq_xx{code=429}` | Warning: >10/s |
| TLS Handshakes | `envoy_listener_ssl_handshake` | Alert on failures |

## ServiceMonitors

- `envoy-gateway-controller` — scrapes controller on port 19001 every 30s
- `envoy-proxy-dataplane` — scrapes proxy on `/stats/prometheus` every 15s

## Alert Rules (15 total)

**Critical:**
- `EnvoyGatewayDown` — controller pod down > 1 minute
- `EnvoyProxyDown` — proxy pod down > 1 minute
- `KCMHighErrorRate` — 5xx rate > 5%
- `TLSCertificateExpired` — cert past expiry

**Warning:**
- `EnvoyGatewayHighMemory` — memory > 85% limit
- `KCMHighLatency` — P99 > 2 seconds
- `KCMLowRequestRate` — frontend < 0.1 req/s
- `KCMRateLimitTriggered` — 429s > 10/s
- `TLSCertificateExpiringSoon` — cert expires in < 14 days
- `TLSHandshakeFailures` — failures > 1/s

## OpenTelemetry Tracing

Envoy Gateway exports traces to OpenTelemetry Collector at `otel-collector.monitoring:4318`.
- **Sample rate:** 5% in production
- **Health checks:** filtered out (not traced)
- **Custom tags:** `service.name`, `environment`, `k8s.pod.name`, `k8s.namespace.name`

## Key Commands

```bash
# Check Prometheus is scraping gateway metrics
kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9090:9090
# Navigate to: http://localhost:9090/targets
# Look for: envoy-gateway-controller and envoy-proxy-dataplane

# Quick metric check
kubectl exec -n monitoring $(kubectl get pod -n monitoring -l app.kubernetes.io/name=prometheus -o name | head -1) \
  -- wget -qO- "http://localhost:9090/api/v1/query?query=up{job='envoy-gateway-controller'}"
```
