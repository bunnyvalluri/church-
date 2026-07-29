# Runbook: Grafana Alloy Collector Pipeline Failure

## Symptom
- Grafana Alloy DaemonSet pods in `CrashLoopBackOff` or reporting backpressure errors.
- Missing log streams in Grafana for specific nodes or namespaces.

## Diagnostics
1. Check Alloy DaemonSet pod status across nodes:
   ```bash
   kubectl get ds alloy-collector -n logging
   kubectl logs -n logging -l app.kubernetes.io/name=alloy --tail=200
   ```
2. Verify connectivity from Alloy to Loki Gateway:
   ```bash
   kubectl exec -it -n logging ds/alloy-collector -- curl -i http://loki-gateway.logging.svc.cluster.local:3100/ready
   ```

## Remediation
1. Restart Alloy DaemonSet:
   ```bash
   kubectl rollout restart ds/alloy-collector -n logging
   ```
2. Validate `/etc/alloy/config.alloy` River syntax:
   ```bash
   kubectl exec -it -n logging ds/alloy-collector -- alloy validate /etc/alloy/config.alloy
   ```
