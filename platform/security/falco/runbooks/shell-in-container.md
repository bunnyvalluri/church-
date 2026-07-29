# 🐚 Shell Spawned in Container — Runbook
## Kingdom of Christ Ministries — Falco Runtime Security

**Alert**: `FalcoShellSpawnedInContainer` / `KCM Shell Spawned in Application Container`  
**Severity**: CRITICAL  
**MITRE ATT&CK**: T1059 — Command and Scripting Interpreter  

---

## What This Alert Means

Falco detected that a shell (`sh`, `bash`, `zsh`, `ksh`) was spawned inside a KCM container.
In production containers, shells should **never** be spawned:
- KCM containers run `node api.js` — not a shell
- No legitimate operation (healthcheck, probe, restart) spawns a shell
- This means: someone is **actively in your container**

---

## Immediate Investigation

### Step 1: Get Context

```bash
# From the Falco alert JSON, extract:
# - container.name
# - k8s.pod.name
# - k8s.ns.name
# - proc.name (which shell)
# - proc.cmdline (what command)
# - user.name (who ran it)

# Check Loki for the full event
# Grafana query: {app="falco"} | json | rule=~".*Shell.*" | last 15 minutes
```

### Step 2: Check if Still Active

```bash
NAMESPACE="kcm-system"  # Update from alert
POD="kcm-backend-api-xxxx"  # Update from alert

# Is the shell still running?
kubectl exec -n $NAMESPACE $POD -- ps aux | grep -E 'sh|bash|zsh' || echo "Shell process ended"

# List all running processes
kubectl exec -n $NAMESPACE $POD -- ps auxf 2>/dev/null || true

# Network connections — reverse shell?
kubectl exec -n $NAMESPACE $POD -- ss -tunp 2>/dev/null | grep ESTABLISHED || true
```

### Step 3: Determine the Entry Point

```bash
# Check parent process (how was the shell spawned?)
# From Falco alert: proc.pname tells you the parent

# Common scenarios:
# pname=node       → Node.js vulnerability exploited (RCE)
# pname=npm        → Malicious npm script
# pname=sh/bash    → Already inside (escalation)
# pname=kubectl    → kubectl exec (check audit logs)

# Check K8s audit logs for exec activity
kubectl get events -n $NAMESPACE --field-selector reason=ExecStarted | tail -10
```

### Step 4: Collect Forensics

```bash
# Capture everything BEFORE the pod restarts
kubectl exec -n $NAMESPACE $POD -- bash -c "
  echo '=== PROCESSES ===' && ps auxf
  echo '=== NETWORK ===' && ss -tunp
  echo '=== FILES MODIFIED ===' && find /app /tmp -newer /app/package.json -type f 2>/dev/null
  echo '=== BASH HISTORY ===' && cat ~/.bash_history 2>/dev/null
  echo '=== CRONTABS ===' && cat /etc/cron* 2>/dev/null
" > /tmp/forensics-shell-$POD-$(date +%s).txt 2>&1 || true

# Save pod YAML
kubectl get pod $POD -n $NAMESPACE -o yaml > /tmp/pod-$POD.yaml
```

---

## Response Decision Tree

```
Shell spawned in KCM container
          │
          ├─► Is proc.pname = "kubectl"?
          │         │
          │         └─► YES → kubectl exec audit
          │                   Was this authorized?
          │                   YES: Close alert (planned maintenance)
          │                   NO:  → CRITICAL: unauthorized exec (escalate)
          │
          ├─► Is this a Node.js child_process spawn?
          │         │
          │         └─► YES → Check proc.cmdline
          │                   Is it npm/build script? → probably OK
          │                   Is it unexpected?       → RCE in Node.js app
          │
          └─► Is proc.name = "sh" with no clear parent?
                    └─► YES → Active intrusion — escalate immediately
```

---

## Containment (If Intrusion Confirmed)

```bash
# 1. Isolate pod
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: shell-isolation-$(date +%s)
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: kcm-backend-api
  policyTypes: [Ingress, Egress]
EOF

# 2. Kill the shell process (if still active — DO NOT let attacker persist)
SHELL_PID=$(kubectl exec -n $NAMESPACE $POD -- pgrep -f "bash\|sh\|zsh" 2>/dev/null | head -1)
if [[ -n "$SHELL_PID" ]]; then
  kubectl exec -n $NAMESPACE $POD -- kill -9 $SHELL_PID
  echo "Killed shell PID $SHELL_PID"
fi

# 3. Force pod deletion and ArgoCD re-deploy
kubectl delete pod $POD -n $NAMESPACE --force --grace-period=0
argocd app sync kcm-backend-prod --force
```

---

## Prevention Check

After incident, verify:

- [ ] Container image doesn't include shell binaries (`which sh bash` should fail)
- [ ] `readOnlyRootFilesystem: true` on all KCM containers
- [ ] `allowPrivilegeEscalation: false` on all KCM containers
- [ ] PSA `restricted` enforced on `kcm-system` namespace
- [ ] Falco rule `KCM Shell Spawned in Application Container` is enabled

```bash
# Verify shell is removed from image
docker run --rm ghcr.io/bunnyvalluri/kcm-backend:latest which sh
# Should return: exit code 1 (not found)
```
