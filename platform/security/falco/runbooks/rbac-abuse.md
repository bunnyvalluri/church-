# 🔑 RBAC Abuse — Runbook
## Kingdom of Christ Ministries — Falco Runtime Security

**Alert**: `FalcoKubernetesSecretsAccess` / `FalcoBulkSecretsAccess` / `FalcoRBACWildcard`  
**Severity**: HIGH → CRITICAL  
**MITRE ATT&CK**: T1078.004 — Valid Accounts: Cloud Accounts, T1552.007 — K8s Secrets  

---

## What This Alert Means

Falco (via K8s audit logs) detected one of:
- Kubernetes secrets bulk-listed (credential dump pattern)
- ClusterRole with wildcard (`*`) permissions created
- Anonymous access to K8s API
- Default ServiceAccount accessing K8s resources

---

## Immediate Investigation

### Step 1: Identify the Actor

```bash
# From Falco alert:
# ka.user.name = who accessed
# ka.user.groups = their groups
# ka.source.ip = where the request came from
# ka.verb = what they did (get/list/create)
# ka.target.resource = what resource (secrets/pods/etc)

USER="<from-alert>"
SOURCE_IP="<from-alert>"

# Is this a service account or human user?
if echo "$USER" | grep -q "system:serviceaccount"; then
  SA_NAMESPACE=$(echo $USER | cut -d: -f4)
  SA_NAME=$(echo $USER | cut -d: -f5)
  echo "ServiceAccount: $SA_NAME in namespace $SA_NAMESPACE"
else
  echo "Human user: $USER from $SOURCE_IP"
fi
```

### Step 2: Check What Was Accessed

```bash
# Secrets accessed
kubectl get events --all-namespaces \
  --field-selector reason=Accessed | grep secrets

# ClusterRoles created recently
kubectl get clusterroles --sort-by=.metadata.creationTimestamp | tail -10

# ClusterRoleBindings created recently
kubectl get clusterrolebindings --sort-by=.metadata.creationTimestamp | tail -10
```

### Step 3: Check for Wildcard Roles

```bash
# Find any ClusterRole with wildcard permissions
kubectl get clusterroles -o json | jq -r '
  .items[] |
  select(.rules[]?.verbs[]? == "*" or .rules[]?.resources[]? == "*") |
  .metadata.name'

# Find roles with wildcard in KCM namespaces
kubectl get roles -n kcm-system -o json | jq -r '
  .items[] |
  select(.rules[]?.verbs[]? == "*") |
  .metadata.name'
```

---

## Containment

### Revoke Suspicious ClusterRoleBinding

```bash
# If a new CRB was created that shouldn't exist
BAD_CRB="<from-alert>"
kubectl delete clusterrolebinding $BAD_CRB

# If a wildcard ClusterRole was created
BAD_CR="<from-alert>"
kubectl delete clusterrole $BAD_CR
```

### Revoke ServiceAccount Token

```bash
# If a ServiceAccount was abused
kubectl delete serviceaccount $SA_NAME -n $SA_NAMESPACE
kubectl create serviceaccount $SA_NAME -n $SA_NAMESPACE  # Recreate fresh

# Restart all pods using this SA to get new token
kubectl rollout restart deployment -n $SA_NAMESPACE
```

### Rotate Affected Secrets

```bash
# If secrets were listed/read, rotate them ALL
# KCM secrets:
kubectl delete secret kcm-secrets -n kcm-system
# Re-apply from sealed-secrets or your secret management system

# Firebase credentials
kubectl delete secret firebase-credentials -n kcm-system

# DB credentials
kubectl delete secret postgres-secret -n kcm-system
```

---

## Prevention

```bash
# 1. Disable automount for default SA
kubectl patch serviceaccount default -n kcm-system \
  -p '{"automountServiceAccountToken": false}'

# 2. Disable anonymous access to K8s API
# kube-apiserver flag: --anonymous-auth=false

# 3. Verify RBAC audit is enabled
kubectl get configmap kube-apiserver -n kube-system -o yaml | grep audit

# 4. Review all ClusterRoles for wildcards
kubectl get clusterroles -o json | jq -r '
  .items[] |
  select(.rules[]?.verbs[]? == "*") |
  .metadata.name' | grep -v "^system:"
```
