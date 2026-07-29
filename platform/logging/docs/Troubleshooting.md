# Logging Platform Troubleshooting Guide

## Common Issues & Diagnostics

### Issue 1: Logs Not Appearing in Grafana
1. Verify Loki HTTP API health:
   ```bash
   kubectl exec -it -n logging statefulset/loki-write-0 -- curl http://localhost:3100/ready
   ```
2. Check Alloy collector status and logs:
   ```bash
   kubectl logs -n logging -l app.kubernetes.io/name=alloy --tail=50
   ```
3. Test LogQL query directly:
   ```bash
   kubectl exec -it -n logging statefulset/loki-write-0 -- logcli query '{namespace="logging"}' --tail=10
   ```

### Issue 2: HTTP 429 Rate Limit Exceeded
1. Increase `ingestion_rate_mb` in `values-loki-ha.yaml`.
2. Inspect log volume by namespace using:
   ```logql
   sum by (namespace) (rate({namespace=~".+"}[5m]))
   ```

### Issue 3: Duplicate Log Entries
- Ensure only one log collector (Alloy OR Promtail) is active per node.
- Check CRI parser configuration in `/etc/alloy/config.alloy`.
