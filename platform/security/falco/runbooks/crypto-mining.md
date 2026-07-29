# ⛏️ Crypto Mining Detected — Runbook
## Kingdom of Christ Ministries — Falco Runtime Security

**Alert**: `FalcoCryptoMiningDetected` / `KCM Crypto Mining Detected`  
**Severity**: CRITICAL  
**MITRE ATT&CK**: T1496 — Resource Hijacking  

---

## What This Alert Means

Falco detected crypto mining behavior in a KCM container:
- Known mining binary (`xmrig`, `minerd`, `cpuminer`) executed
- Process arguments containing `stratum://`, `stratum+tcp://`, `--pool`
- CPU usage characteristic of mining workloads

**Impact**: Resource theft, cost spike, cluster degradation, potential backdoor.

---

## Immediate Actions

### Step 1: Identify the Miner

```bash
# From Falco alert
POD="<pod-from-alert>"
NAMESPACE="<namespace-from-alert>"

# Confirm mining process
kubectl exec -n $NAMESPACE $POD -- ps aux | grep -E 'xmrig|minerd|cpuminer|stratum'

# Get CPU usage — miners use 100% CPU
kubectl top pod $POD -n $NAMESPACE
```

### Step 2: Kill the Miner

```bash
# Kill mining process immediately
MINER_PID=$(kubectl exec -n $NAMESPACE $POD -- pgrep -f "xmrig\|minerd\|cpuminer" 2>/dev/null)
if [[ -n "$MINER_PID" ]]; then
  kubectl exec -n $NAMESPACE $POD -- kill -9 $MINER_PID
  echo "Miner killed: PID $MINER_PID"
fi
```

### Step 3: Isolate and Delete

```bash
# Isolate pod — stop mining pool connection
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mining-isolation-$POD
  namespace: $NAMESPACE
spec:
  podSelector: {matchLabels: {app: kcm-backend-api}}
  policyTypes: [Ingress, Egress]
EOF

# Force delete pod
kubectl delete pod $POD -n $NAMESPACE --force --grace-period=0

# ArgoCD will redeploy clean pod
argocd app sync kcm-backend-prod
```

---

## Investigation

### How Did the Miner Get In?

```bash
# 1. Check when the mining binary appeared
kubectl exec -n $NAMESPACE $POD -- find / -name "xmrig" -o -name "minerd" 2>/dev/null

# 2. Check download history
kubectl exec -n $NAMESPACE $POD -- bash -c "find /tmp /var /app -newer /app/package.json -type f 2>/dev/null"

# 3. Check for downloaded scripts
kubectl exec -n $NAMESPACE $POD -- cat /tmp/*.sh 2>/dev/null

# 4. Check parent process (how was miner launched?)
# From Falco alert: proc.pname

# 5. Check network — what mining pool?
kubectl exec -n $NAMESPACE $POD -- ss -tunp | grep -v "127\|10\.\|172\.\|192.168"
```

### Check for Persistence Mechanisms

```bash
# Cron-based persistence
kubectl exec -n $NAMESPACE $POD -- crontab -l 2>/dev/null
kubectl exec -n $NAMESPACE $POD -- ls /etc/cron.d/ 2>/dev/null

# systemd/init persistence (unlikely in containers)
kubectl exec -n $NAMESPACE $POD -- ls /etc/systemd/system/ 2>/dev/null

# Check if miner persists across pod restart (indicates volume mount abuse)
# If miner re-appears → check PersistentVolumeClaims
kubectl get pvc -n $NAMESPACE
```

### Cost Impact Assessment

```bash
# Check node CPU spike in Prometheus
# Grafana query: sum(rate(container_cpu_usage_seconds_total{namespace="kcm-system"}[5m])) by (pod)

# Check how long mining ran
# Loki query: {app="falco"} | json | rule=~".*[Mm]ining.*" | line_format "{{.time}}"
```

---

## Prevention

```bash
# 1. Verify mining binaries cannot be downloaded (network egress restrictions)
# Network policy should block external egress on unexpected ports

# 2. Verify readOnlyRootFilesystem prevents writing miner to disk
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.readOnlyRootFilesystem}'
# Should be: true

# 3. CPU limits prevent runaway resource consumption
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].resources.limits.cpu}'
# Should be set (e.g. 800m)
```

---

## Report

Document in incident report:
- Mining binary found: `xmrig` / `minerd` / other
- Entry vector: RCE / supply chain / misconfiguration
- Mining pool address: (from network capture)
- Duration of mining: (Loki timestamp range)
- Estimated cost impact: (node CPU hours wasted)
