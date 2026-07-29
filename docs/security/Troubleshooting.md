# Troubleshooting — Falco Runtime Security
## Kingdom of Christ Ministries

---

## Falco Not Starting

### Symptom: Falco pod in CrashLoopBackOff

```bash
kubectl logs -n falco daemonset/falco --previous
```

**Common causes**:

#### 1. eBPF driver not supported by kernel

```
Error: failed to open BPF probe
```

**Fix**: Switch to `ebpf` or `kmod` driver:
```yaml
# values.yaml
driver:
  kind: ebpf   # or kmod
```

#### 2. Missing kernel headers

```
Error: Cannot find kernel headers
```

**Fix**: Install kernel headers on nodes:
```bash
# Ubuntu/Debian
sudo apt-get install linux-headers-$(uname -r)
# CentOS/RHEL
sudo yum install kernel-devel-$(uname -r)
```

#### 3. Namespace PSA blocking pod start

```
Error: pods "falco-xxx" is forbidden: violates PodSecurity "restricted"
```

**Fix**: Ensure the `falco` namespace has `privileged` PSA label:
```bash
kubectl get namespace falco -o yaml | grep pod-security
# Should show: pod-security.kubernetes.io/enforce: privileged
kubectl apply -f platform/security/falco/kubernetes/namespace.yaml
```

---

## Falco Running But No Events

### Symptom: Falco pod running, no events in Loki/Grafana

```bash
# Check if Falco is generating any output
kubectl logs -n falco daemonset/falco --tail=50

# Check Falcosidekick is receiving
kubectl logs -n falco deployment/falcosidekick --tail=50 | grep "falco"
```

**Common causes**:

#### 1. HTTP output not reaching Falcosidekick

```bash
# Verify Falcosidekick service endpoint
kubectl get svc -n falco falcosidekick

# Test connectivity from Falco pod
kubectl exec -n falco daemonset/falco -- \
  curl -s http://falcosidekick.falco.svc.cluster.local:2801/
# Should return 404 (service up) not connection refused
```

#### 2. Priority too high (filtering out events)

```yaml
# values.yaml — lower threshold to see more events
falco:
  priority: debug   # temporary for debugging
```

#### 3. Rules not loading

```bash
kubectl exec -n falco daemonset/falco -- \
  falco --list | grep "KCM"
# If empty → custom rules not loaded
```

---

## Falcosidekick Not Sending to Loki

```bash
# Check Loki connectivity
kubectl exec -n falco deployment/falcosidekick -- \
  curl -s http://loki.monitoring.svc.cluster.local:3100/ready
# Should return: ready

# Check Falcosidekick logs
kubectl logs -n falco deployment/falcosidekick | grep -i "loki\|error"
```

**Fix**: Verify Loki endpoint in `values-falcosidekick.yaml`:
```yaml
config:
  loki:
    hostport: "http://loki.monitoring.svc.cluster.local:3100"
```

---

## Prometheus Not Scraping Falcosidekick

```bash
# Verify ServiceMonitor exists
kubectl get servicemonitor -n monitoring falcosidekick

# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-k8s 9090:9090
# Browse: http://localhost:9090/targets
# Look for: falco/falcosidekick
```

**Fix**: Ensure ServiceMonitor has correct labels:
```yaml
metadata:
  labels:
    release: kube-prometheus-stack   # must match Prometheus selector
```

---

## Grafana Dashboards Not Showing

```bash
# Check dashboard ConfigMaps are created
kubectl get configmaps -n monitoring | grep grafana-dashboard-falco

# Check Grafana sidecar is picking them up
kubectl logs -n monitoring deployment/grafana -c grafana-sc-dashboard | tail -20
```

**Fix**: Ensure ConfigMaps have the `grafana_dashboard: "1"` label:
```bash
kubectl label configmap grafana-dashboard-falco-security-overview \
  grafana_dashboard=1 -n monitoring
```

---

## Custom Rules Not Detecting Events

```bash
# Validate rule syntax
falco --validate platform/security/falco/rules/kcm-custom-rules.yaml

# List loaded rules
kubectl exec -n falco daemonset/falco -- \
  falco --list | grep -i "kcm"

# Check ConfigMap is mounted
kubectl exec -n falco daemonset/falco -- \
  ls /etc/falco/rules.d/
```

---

## High CPU Usage by Falco

Falco CPU spikes during high event volume.

```bash
# Check kernel event drops (indicates overload)
kubectl logs -n falco daemonset/falco | grep "syscall_event_drops"

# Increase Falco CPU limits
# Edit values.yaml:
resources:
  limits:
    cpu: 4000m   # increase from 2000m

# Or increase the event drop threshold
falco:
  syscall_event_drops:
    rate: 0.1    # increase from 0.03333
```

---

## NetworkPolicy Blocking Falco Events

```bash
# Test if NetworkPolicy is blocking Loki egress
kubectl exec -n falco deployment/falcosidekick -- \
  nc -zv loki.monitoring.svc.cluster.local 3100
# If fails → NetworkPolicy is blocking

# Temporarily remove NetworkPolicy to test
kubectl delete networkpolicy falco-network-policy -n falco
# Re-apply after confirming issue
kubectl apply -f platform/security/falco/kubernetes/network-policy.yaml
```

---

## Useful Debug Commands

```bash
# Complete Falco status check
kubectl get pods -n falco -o wide
kubectl describe daemonset falco -n falco
kubectl get events -n falco --sort-by=.lastTimestamp | tail -20

# Test event generation
kubectl run shell-test --image=alpine --rm -it --restart=Never -- sh
# → Should trigger KCM Shell Spawned rule

# Check Prometheus metrics available
kubectl port-forward -n falco svc/falcosidekick 2802:2802 &
curl -s http://localhost:2802/metrics | grep falco

# ArgoCD sync status
argocd app list | grep falco
argocd app get falco --output wide
```
