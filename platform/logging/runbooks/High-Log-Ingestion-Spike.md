# Runbook: High Log Ingestion Rate Spike

## Symptom
- High rate of logs flooding Grafana Loki (`ingestion_rate_mb` limit hit).
- Loki rate limit errors (`429 Rate Limit Exceeded`).

## Diagnostics
1. Query Loki for top log producers:
   ```logql
   topk(10, sum by (container, namespace) (rate({namespace=~".+"}[5m])))
   ```
2. Identify noisy container or runaway debug loop.

## Remediation
1. Adjust rate limit settings dynamically in `values-loki-ha.yaml`:
   ```yaml
   limits_config:
     ingestion_rate_mb: 64
     ingestion_burst_size_mb: 128
   ```
2. Apply filter rule in Alloy pipeline to drop non-essential debug logs from spamming pods:
   ```river
   stage.drop {
     source = "level"
     value  = "DEBUG"
   }
   ```
