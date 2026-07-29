# 🚨 Critical Incident Response — Falco Runtime Security
## Kingdom of Christ Ministries

**Severity**: CRITICAL  
**Response Time**: Immediate (< 5 minutes)  
**Escalation**: Security Lead → CTO  

---

## Overview

This runbook is triggered when Falco fires a `CRITICAL` severity alert in the KCM cluster.
Critical events represent active exploitation or imminent compromise.

**DO NOT** attempt to preserve the pod or workload. **Isolate first.**

---

## Immediate Actions (First 5 Minutes)

### 1. Confirm the Alert

```bash
# Check active Falco alerts in Alertmanager
curl -s http://alertmanager.monitoring.svc.cluster.local:9093/api/v2/alerts \
  | jq '.[] | select(.labels.severity == "critical" and .labels.team == "security")'

# Check Falco logs directly
kubectl logs -n falco daemonset/falco --tail=50 | grep '"priority":"CRITICAL"'

# Query Loki for recent critical events
# In Grafana: {app="falco"} | json | priority="CRITICAL" | last 10 minutes
```

### 2. Identify the Affected Pod

```bash
# Get pod details from the alert
NAMESPACE=$(echo $ALERT | jq -r '.labels.k8s_ns_name')
POD=$(echo $ALERT | jq -r '.labels.k8s_pod_name')
NODE=$(echo $ALERT | jq -r '.labels.k8s_node_name')

kubectl get pod $POD -n $NAMESPACE -o wide
kubectl describe pod $POD -n $NAMESPACE
```

### 3. Isolate the Pod — NetworkPolicy

```bash
# Apply emergency isolation NetworkPolicy — blocks ALL ingress/egress
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: emergency-isolation-$POD
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: $(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.metadata.labels.app}')
  policyTypes:
    - Ingress
    - Egress
EOF
echo "🔒 Pod $POD isolated via NetworkPolicy"
```

### 4. Capture Forensic Evidence

```bash
# Dump pod state BEFORE deletion
kubectl get pod $POD -n $NAMESPACE -o yaml > /tmp/forensics-pod-$POD-$(date +%s).yaml

# Dump running processes in container
kubectl exec -n $NAMESPACE $POD -- ps auxf > /tmp/forensics-ps-$POD.txt 2>/dev/null || true

# Dump network connections
kubectl exec -n $NAMESPACE $POD -- ss -tulnp > /tmp/forensics-netstat-$POD.txt 2>/dev/null || true

# Capture Falco events for this pod from Loki
echo "Query Loki: {app=\"falco\",k8s_pod_name=\"$POD\"} | json"

# Archive to persistent storage
kubectl cp $NAMESPACE/$POD:/tmp /tmp/forensics-$POD/ 2>/dev/null || true
```

### 5. Scale Down the Compromised Workload

```bash
# Find owner (Deployment/DaemonSet)
OWNER=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.metadata.ownerReferences[0].name}')
OWNER_KIND=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.metadata.ownerReferences[0].kind}')

# Scale to 0 (for Deployment)
if [[ "$OWNER_KIND" == "ReplicaSet" ]]; then
  DEPLOYMENT=$(kubectl get replicaset $OWNER -n $NAMESPACE -o jsonpath='{.metadata.ownerReferences[0].name}')
  kubectl scale deployment $DEPLOYMENT -n $NAMESPACE --replicas=0
  echo "⚠️ Deployment $DEPLOYMENT scaled to 0"
fi

# Delete the compromised pod
kubectl delete pod $POD -n $NAMESPACE --force --grace-period=0
echo "🗑️ Pod $POD deleted"
```

---

## Investigation (5–30 Minutes)

### Review Falco Event Timeline

```bash
# All events for this pod in last 24h (Grafana/Loki query)
{app="falco"} | json | k8s_pod_name="$POD" | __error__=""

# Events on the affected node
{app="falco"} | json | hostname="$NODE"
```

### Check for Lateral Movement

```bash
# Check if same attack pattern on other pods
kubectl get pods -n $NAMESPACE -o wide

# Check if any new pods were spawned (drift detection)
kubectl get pods --all-namespaces --sort-by=.metadata.creationTimestamp | tail -20

# Review recent ClusterRoleBinding changes
kubectl get events --all-namespaces --field-selector reason=ClusterRoleBindingCreated

# Check for new ServiceAccounts
kubectl get serviceaccounts --all-namespaces | grep -v system:
```

### Examine Container Image

```bash
# Get image details
IMAGE=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[0].image}')
echo "Compromised image: $IMAGE"

# Check if image is the official KCM image
# Official: ghcr.io/bunnyvalluri/kcm-backend:*
# If unexpected image → supply chain attack
```

---

## Containment

```bash
# 1. Revoke ServiceAccount token (if SA was compromised)
SA=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.serviceAccountName}')
kubectl delete secret $(kubectl get serviceaccount $SA -n $NAMESPACE -o jsonpath='{.secrets[*].name}') -n $NAMESPACE

# 2. Rotate affected secrets
kubectl delete secret kcm-secrets -n $NAMESPACE
# Re-apply from sealed secrets or Vault

# 3. Block the attacker's IP at Envoy Gateway level (if identified)
# Update HTTPRoute or EnvoyFilter

# 4. Notify on-call team
echo "CRITICAL: KCM pod $POD compromised at $(date). Namespace: $NAMESPACE. Node: $NODE"
```

---

## Recovery

```bash
# 1. Verify the container image is clean (CI/CD should re-deploy)
# ArgoCD will auto-heal — verify with:
argocd app get kcm-backend-prod

# 2. Force ArgoCD re-sync with clean image
argocd app sync kcm-backend-prod --force

# 3. Remove emergency isolation NetworkPolicy after clean deploy
kubectl delete networkpolicy emergency-isolation-$POD -n $NAMESPACE

# 4. Verify no Falco alerts after recovery
kubectl logs -n falco daemonset/falco --tail=20
```

---

## Post-Incident

- [ ] File incident report within 24 hours
- [ ] Update Falco rules if new attack pattern identified
- [ ] Review whether PSA/RBAC prevented or could have prevented the attack
- [ ] Check if CI/CD was compromised (review GitHub Actions logs)
- [ ] Rotate ALL secrets in affected namespace as precaution
- [ ] Schedule post-mortem within 48 hours

---

## Escalation

| Severity | Escalate To | SLA |
|---|---|---|
| CRITICAL | Security Lead | Immediate |
| CRITICAL + Data Breach | CTO + Legal | < 1 hour |
| CRITICAL + Payment Data | CTO + Compliance | < 30 min |

**Emergency contacts**: See `docs/security/IncidentResponse.md`
