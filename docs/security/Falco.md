# Falco — Installation & Configuration
## Kingdom of Christ Ministries

## What Is Falco?

Falco is the **CNCF graduated** open-source cloud-native runtime security project.
It uses the Linux kernel's eBPF subsystem (or a kernel module) to intercept and analyze
system calls in real time, matching them against a rules engine to detect threats.

**Official project**: https://github.com/falcosecurity/falco  
**Official Helm chart**: https://falcosecurity.github.io/charts  
**KCM deployment**: Official chart only — no fork, no modification.

---

## Prerequisites

- Kubernetes >= 1.24
- Kernel >= 5.8 (for `modern_ebpf` driver) OR kernel >= 4.14 (for `ebpf` driver)
- Helm >= 3.14
- `kubectl` cluster-admin access
- ArgoCD deployed (for GitOps management)

---

## Installation

### Via ArgoCD (Recommended — GitOps)

```bash
# Apply the ArgoCD AppProject and Applications
kubectl apply -f kcm-church-infra/security/falco/argocd-project.yaml
kubectl apply -f kcm-church-infra/security/falco/argocd-application.yaml

# Watch rollout
argocd app list | grep falco
argocd app wait falco --health --sync --timeout 600
```

### Via Helm (Manual)

```bash
# Add Falco Helm repo (official)
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update

# Create namespace with correct PSA labels
kubectl apply -f platform/security/falco/kubernetes/namespace.yaml

# Apply RBAC
kubectl apply -f platform/security/falco/kubernetes/rbac.yaml
kubectl apply -f platform/security/falco/kubernetes/serviceaccount.yaml

# Apply NetworkPolicy
kubectl apply -f platform/security/falco/kubernetes/network-policy.yaml

# Deploy custom rules ConfigMap
kubectl apply -f platform/security/falco/kubernetes/configmap-rules.yaml

# Install Falco
helm upgrade --install falco falcosecurity/falco \
  --version 4.3.0 \
  --namespace falco \
  --create-namespace \
  -f platform/security/falco/helm/values.yaml \
  -f platform/security/falco/helm/values-ha.yaml \
  --wait --timeout 10m

# Install Falcosidekick
helm upgrade --install falcosidekick falcosecurity/falcosidekick \
  --namespace falco \
  -f platform/security/falco/helm/values-falcosidekick.yaml \
  --wait
```

### Via OpenTofu

```bash
cd platform/opentofu

tofu init
tofu plan -target=module.falco -out=falco.plan
tofu apply falco.plan

# Then deploy monitoring resources
tofu plan -target=module.falco_monitoring -out=monitoring.plan
tofu apply monitoring.plan
```

---

## Verification

```bash
# 1. All Falco pods running (1 per node)
kubectl get pods -n falco -l app.kubernetes.io/name=falco
# Expected: STATUS=Running, one per cluster node

# 2. Falcosidekick running (2 replicas HA)
kubectl get pods -n falco -l app.kubernetes.io/name=falcosidekick
# Expected: 2/2 Running

# 3. Falco generating events
kubectl logs -n falco daemonset/falco --tail=20
# Expected: JSON security events in log output

# 4. Events flowing to Falcosidekick
kubectl logs -n falco deployment/falcosidekick --tail=20
# Expected: Sending events to Loki/Alertmanager logs

# 5. Trigger a test detection
kubectl run test-shell --image=ubuntu --rm -it --restart=Never -- sh
# Expected: Falco fires "Terminal shell in container" within 1 second

# 6. Prometheus scraping Falcosidekick metrics
kubectl port-forward -n falco svc/falcosidekick 2802:2802
curl -s http://localhost:2802/metrics | grep falcosidekick_falco_events_total
```

---

## Driver Selection

| Driver | Kernel Req | Pros | Cons |
|---|---|---|---|
| `modern_ebpf` | >= 5.8 | No compilation, CO-RE, most stable | Newer kernel required |
| `ebpf` | >= 4.14 | No kernel module | Requires BPF headers |
| `kmod` | Any | Universal | Kernel module loading, less secure |

Change driver:
```bash
# Edit values.yaml
driver:
  kind: ebpf   # or modern_ebpf or kmod

# Update via ArgoCD (triggers auto-sync) or helm upgrade
```

---

## Key Configuration Files

| File | Purpose |
|---|---|
| `platform/security/falco/helm/values.yaml` | Core Falco configuration |
| `platform/security/falco/helm/values-falcosidekick.yaml` | Event routing to Loki/Alertmanager |
| `platform/security/falco/helm/values-ha.yaml` | HA overlay (more tolerations, resources) |
| `platform/security/falco/kubernetes/namespace.yaml` | falco namespace with PSA |
| `platform/security/falco/kubernetes/rbac.yaml` | ClusterRole (read-only) |
| `platform/security/falco/kubernetes/configmap-rules.yaml` | Bundled custom rules |

---

## Upgrade

```bash
# Check latest chart version
helm search repo falcosecurity/falco --versions | head -5

# Update version in ArgoCD Application or values
# Edit: kcm-church-infra/security/falco/argocd-application.yaml
# Change targetRevision: "4.x" → specific version

# ArgoCD auto-syncs → rollingUpdate DaemonSet upgrade
# Or manual:
helm upgrade falco falcosecurity/falco \
  --namespace falco \
  --version 4.4.0 \
  -f platform/security/falco/helm/values.yaml \
  -f platform/security/falco/helm/values-ha.yaml
```
