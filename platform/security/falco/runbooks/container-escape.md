# 🐳 Container Escape — Runbook
## Kingdom of Christ Ministries — Falco Runtime Security

**Alert**: `FalcoContainerEscapeAttempt` / `KCM Container Escape Attempt`  
**Severity**: CRITICAL — NODE LEVEL THREAT  
**MITRE ATT&CK**: T1611 — Escape to Host  

---

> [!CAUTION]
> Container escape means the attacker may have HOST-LEVEL access.
> All workloads on the affected NODE are compromised.
> Escalate to node isolation immediately.

---

## Immediate Actions

### Step 1: Identify Node

```bash
POD="<from-alert>"
NAMESPACE="<from-alert>"

# Get the affected node
NODE=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.nodeName}')
echo "Affected node: $NODE"

# List ALL pods on this node
kubectl get pods --all-namespaces --field-selector spec.nodeName=$NODE
```

### Step 2: Cordon the Node

```bash
# Prevent new pods from scheduling on compromised node
kubectl cordon $NODE
echo "🚧 Node $NODE cordoned"

# Drain non-critical pods from node (move workloads to clean nodes)
kubectl drain $NODE \
  --ignore-daemonsets \
  --delete-emptydir-data \
  --force \
  --grace-period=30 \
  --timeout=120s
echo "🔄 Node $NODE drained"
```

### Step 3: Check for Escape Success

```bash
# Is there a host process from the container?
# Falco rule "KCM Host Process From Container" would fire if escape succeeded

# On the node (requires node SSH/emergency access):
# Check for new unusual processes on host
# ssh $NODE "ps auxf | grep -v '\[' | head -50"

# Check host network connections
# ssh $NODE "ss -tunp"

# Check for suspicious files on host
# ssh $NODE "find /tmp /var/tmp -newer /etc/passwd -type f 2>/dev/null"
```

### Step 4: Isolate the Escape Vector

```bash
# Was it via:
# /proc/1/ns/   → PID namespace escape
# /host/etc/    → HostPath mount abuse
# Docker socket → /var/run/docker.sock access
# privileged container → full host access

# From Falco alert: fd.name shows what was accessed
# fd.name startswith /proc/1/ → namespace escape attempt
# fd.name startswith /host/   → HostPath mount abuse
```

---

## Investigation

### Identify Escape Technique

```bash
# 1. HostPath Mount escape
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.volumes}'
# Look for hostPath volumes mounting /etc, /proc, /var/run

# 2. Privileged container
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.privileged}'
# true = full host access possible

# 3. Docker socket mount
kubectl get pod $POD -n $NAMESPACE -o json \
  | jq '.spec.volumes[] | select(.hostPath.path == "/var/run/docker.sock")'
# Any result here = critical misconfiguration

# 4. Capability abuse
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.capabilities}'
# SYS_ADMIN = escape possible
```

---

## Recovery

```bash
# 1. Delete the escaped container
kubectl delete pod $POD -n $NAMESPACE --force --grace-period=0

# 2. Fix the misconfiguration that enabled escape
# Remove dangerous HostPath mounts from the Deployment/Helm values

# 3. Rebuild node if escape was confirmed successful
# Mark node for replacement in your cloud provider

# 4. Rotate all secrets that were accessible from the node
# (node kubelet has access to all secrets mounted on its pods)
kubectl delete secret --all -n kcm-system  # CAUTION: reprovision from sealed-secrets

# 5. Uncordon only after node is rebuilt/verified clean
# kubectl uncordon $NODE  # Only after node remediation
```

---

## Prevention

```bash
# 1. No hostPath mounts in production
# 2. Non-privileged containers (privileged: false)
# 3. Drop ALL capabilities (capabilities.drop: [ALL])
# 4. No Docker socket mounts
# 5. seccomp: RuntimeDefault blocks most escape syscalls
# 6. AppArmor: docker-default profile
# 7. PSA restricted: prevents all the above misconfigurations

# Verify PSA is restricting escape vectors
kubectl get namespace kcm-system -o yaml | grep pod-security
# pod-security.kubernetes.io/enforce: restricted
```
