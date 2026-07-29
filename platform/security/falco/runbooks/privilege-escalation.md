# 🔐 Privilege Escalation — Runbook
## Kingdom of Christ Ministries — Falco Runtime Security

**Alert**: `FalcoPrivilegeEscalation` / `KCM Privilege Escalation Attempt`  
**Severity**: CRITICAL  
**MITRE ATT&CK**: T1548 — Abuse Elevation Control Mechanism  

---

## Immediate Actions

### Step 1: Identify

```bash
POD="<from-alert>"
NAMESPACE="<from-alert>"

# Who is trying to escalate?
kubectl exec -n $NAMESPACE $POD -- id
kubectl exec -n $NAMESPACE $POD -- cat /proc/self/status | grep -E "Uid|Gid|Groups"

# What syscall triggered? (from Falco alert: evt.type)
# setuid / setgid → direct escalation
# sudo → sudo abuse
```

### Step 2: Check Current Privilege State

```bash
# Is the container already running as root?
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.runAsUser}'
# KCM containers should be 1001 — if 0, already escalated

# Check pod security context
kubectl get pod $POD -n $NAMESPACE -o json | jq '.spec.securityContext'

# Is the container privileged?
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.privileged}'
```

### Step 3: Isolate and Capture

```bash
# Apply isolation NetworkPolicy
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: privesc-isolation-$(date +%s)
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: $(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.metadata.labels.app}')
  policyTypes: [Ingress, Egress]
EOF

# Capture state
kubectl exec -n $NAMESPACE $POD -- id > /tmp/privesc-forensics-$POD.txt
kubectl exec -n $NAMESPACE $POD -- cat /proc/self/status >> /tmp/privesc-forensics-$POD.txt
kubectl exec -n $NAMESPACE $POD -- ps auxf >> /tmp/privesc-forensics-$POD.txt

# Delete pod
kubectl delete pod $POD -n $NAMESPACE --force --grace-period=0
```

---

## Investigation

### Was Escalation Successful?

```bash
# Check what the process UID was at the time of the alert
# Falco alert contains: user.uid (before escalation) 

# If user.uid was 1001 and setuid was called → escalation attempted
# If user.uid changed to 0 → escalation SUCCEEDED

# Check if attacker has root now via audit events
kubectl get events -n $NAMESPACE | grep Warning
```

### Entry Vector Analysis

```bash
# SUID binary abuse?
kubectl exec -n $NAMESPACE $POD -- find / -perm -u+s -type f 2>/dev/null
# No SUID binaries should exist in KCM images

# sudo misconfiguration?
kubectl exec -n $NAMESPACE $POD -- sudo -l 2>/dev/null
# Should fail — sudo not installed

# Kernel exploit (most dangerous)?
# Check kernel version
kubectl get nodes -o jsonpath='{.items[*].status.nodeInfo.kernelVersion}'
# Compare against known CVEs
```

---

## Prevention Verification

```bash
# 1. allowPrivilegeEscalation MUST be false
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.allowPrivilegeEscalation}'
# Should be: false

# 2. Drop ALL capabilities, add only required ones
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].securityContext.capabilities}'

# 3. Seccomp profile should block setuid/setgid syscalls
kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.securityContext.seccompProfile}'
# Should be: {type: RuntimeDefault}

# 4. Pod Security Admission — restricted profile
kubectl get namespace $NAMESPACE -o jsonpath='{.metadata.labels.pod-security\.kubernetes\.io/enforce}'
# Should be: restricted
```
