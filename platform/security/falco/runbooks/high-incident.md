# High Severity Incident Response — Falco
## Kingdom of Christ Ministries

**Severity**: HIGH  
**Response Time**: < 30 minutes  
**On-call**: Security Engineer  

---

## When This Runbook Triggers

- `FalcoHighSeverityBurst` — multiple HIGH events in short window
- `FalcoKubectlExecProduction` — exec into production pod
- `FalcoKubernetesSecretsAccess` — secrets accessed
- `FalcoUnexpectedNetworkConnection` — unexpected outbound

---

## Investigation Steps

### Step 1: Understand the Alert

```bash
# Get alert details from Alertmanager
kubectl port-forward -n monitoring svc/alertmanager-operated 9093:9093 &
curl -s http://localhost:9093/api/v2/alerts | \
  jq '.[] | select(.labels.severity=="high")'

# Check Falco logs
kubectl logs -n falco daemonset/falco --tail=30 | \
  jq 'select(.priority=="HIGH")'

# Query Loki for context
# {app="falco"} | json | priority="high" | last 30m
```

### Step 2: Assess Business Impact

| Workload | Data Sensitivity | Impact Level |
|---|---|---|
| `kcm-backend-api` | Auth, payment data | CRITICAL business impact |
| `kcm-backend-worker` | Queue jobs | HIGH business impact |
| `kcm-frontend` | Public website | MEDIUM business impact |
| `kcm-backend-cron` | Scheduled tasks | MEDIUM business impact |

### Step 3: kubectl exec Investigation

```bash
# If alert is kubectl exec — was it authorized?
# Check who ran it:
# ka.user.name from Falco alert

# Check if this was planned maintenance
# (consult change log or calendar)

# If unauthorized:
kubectl get events -n kcm-system --field-selector reason=ExecStarted | tail -5

# Audit trail in Loki:
# {app="falco"} | json | rule=~".*Exec.*"
```

### Step 4: Network Connection Investigation

```bash
# Get destination from alert: fd.rip, fd.rport
DEST_IP="<from-alert>"
DEST_PORT="<from-alert>"

# Geolocate the destination
curl -s "https://ipapi.co/$DEST_IP/json/" | jq '.country_name, .org'

# Is it a known good endpoint?
# Good: Stripe IPs, Firebase IPs, Google Cloud
# Bad: Unknown VPS, TOR exit nodes, crypto pool IPs

# Check if connection is still active
POD="<from-alert>"
NAMESPACE="<from-alert>"
kubectl exec -n $NAMESPACE $POD -- ss -tunp 2>/dev/null | grep $DEST_IP
```

---

## Response Actions

### For Unauthorized kubectl exec

```bash
# 1. Document the incident
echo "kubectl exec by $USER at $(date) to pod $POD in $NAMESPACE from IP $SOURCE_IP"

# 2. If unauthorized:
# Revoke the user's RBAC (if compromised credentials)
kubectl delete clusterrolebinding <binding-name>  # only if confirmed malicious

# 3. Rotate user's kubeconfig credentials
# Follow your cluster authentication provider's rotation process
```

### For Unexpected Network Connection

```bash
# 1. Capture network state
kubectl exec -n $NAMESPACE $POD -- ss -tunp > /tmp/netstat-evidence.txt

# 2. If malicious destination:
# Apply egress NetworkPolicy to block
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: emergency-egress-block-$(date +%s)
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: $(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.metadata.labels.app}')
  policyTypes: [Egress]
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kcm-system
      ports:
        - port: 5432
        - port: 6379
EOF
```

### For Secrets Access

```bash
# 1. Check what secrets were accessed
# From Falco alert: ka.target.name = secret name

# 2. Rotate the accessed secret immediately
SECRET="<from-alert>"
NAMESPACE="<from-alert>"

# Get current secret value
kubectl get secret $SECRET -n $NAMESPACE -o json | jq '.data' | base64 -d

# Delete and recreate with new values
kubectl delete secret $SECRET -n $NAMESPACE
# Re-create from your secret management system (sealed-secrets/Vault)

# 3. Restart affected workloads to pick up new secret
kubectl rollout restart deployment -n $NAMESPACE
```

---

## Post-Investigation

- [ ] Document timeline and findings
- [ ] Determine if escalation to CRITICAL needed
- [ ] Tune Falco rules if false positive
- [ ] Update RBAC if over-permissioned
- [ ] File in incident log
