# Falco Rules Reference
## Kingdom of Christ Ministries

## Rule Files Overview

| File | Purpose | Rules Count |
|---|---|---|
| `falco_rules.yaml` | Official Falco defaults (200+) | ~200 |
| `kcm-custom-rules.yaml` | KCM base macros, lists, core rules | 11 |
| `kcm-portals.yaml` | Portal-specific rules | 8 |
| `kcm-api-rules.yaml` | Auth/Payment/Media API rules | 10 |
| `kcm-k8s-rules.yaml` | Kubernetes threat detection | 13 |
| `kcm-workers.yaml` | Worker and Cron rules | 9 |

**Total KCM custom rules: 51**

---

## Rule Anatomy

```yaml
- rule: Rule Name            # Unique identifier
  desc: >                    # Human-readable description
    Explanation of what this rule detects.
  condition: >               # Boolean expression
    spawned_process
    and kcm_app_container
    and not proc.name in (kcm_trusted_processes)
  output: >                  # Alert message with field interpolation
    HIGH: Process spawned
    (user=%user.name pod=%k8s.pod.name ns=%k8s.ns.name)
  priority: HIGH             # EMERGENCY/ALERT/CRITICAL/ERROR/WARNING/NOTICE/INFO/DEBUG
  tags:                      # For filtering and categorization
    - kcm
    - process
    - T1059
```

---

## KCM Macros Reference

| Macro | Condition |
|---|---|
| `kcm_app_container` | Container in kcm_namespaces |
| `kcm_trusted_user` | User in trusted list (uid 1001, node) |
| `kcm_infra_namespace` | Namespace is falco/monitoring/argocd |
| `kcm_privileged_container` | privileged=true AND not in infra namespaces |
| `spawned_shell_in_container` | Shell binary exec'd in container |
| `kcm_unexpected_outbound` | Outbound on non-allowlisted port |
| `kcm_untrusted_process` | Process not in trusted list |
| `kcm_backend_api_pod` | kcm-backend-api pod |
| `kcm_worker_container` | kcm-backend-worker pod |
| `kcm_cron_container` | kcm-backend-cron pod |
| `kcm_admin_portal` | Church admin portal pods |

---

## Adding Custom Rules

### Step 1: Edit the Rule File

```bash
# Edit the appropriate rule file
vim platform/security/falco/rules/kcm-custom-rules.yaml
```

### Step 2: Validate

```bash
# Validate syntax
falco --validate platform/security/falco/rules/kcm-custom-rules.yaml

# Falcoctl lint
falcoctl artifact lint --type rulesfile \
  platform/security/falco/rules/kcm-custom-rules.yaml
```

### Step 3: Commit and Push

```bash
git add platform/security/falco/rules/
git commit -m "security: add rule for [threat description]"
git push origin main
# ArgoCD auto-syncs → Falco hot-reloads rules
```

### Step 4: Verify

```bash
# Check rule loaded
kubectl exec -n falco daemonset/falco -- \
  falco --list | grep "Your Rule Name"
```

---

## Disabling Built-in Rules

Falco default rules can be disabled without modifying the official chart:

```yaml
# In falco_rules.local.yaml (via ConfigMap)
- rule: Write below binary dir
  enabled: false

- rule: Read sensitive file untrusted
  override:
    condition: append
    # Add an exception for KCM's legitimate access
    condition: and not kcm_app_container
```

---

## Priority Reference

| Priority | Use Case |
|---|---|
| `EMERGENCY` | System is unusable |
| `ALERT` | Action must be taken immediately |
| `CRITICAL` | Critical condition — active compromise |
| `ERROR` | Error condition |
| `WARNING` | Warning — suspicious but not confirmed |
| `NOTICE` | Normal but significant condition |
| `INFO` | Informational only |
| `DEBUG` | Debug-level events |

KCM rules use CRITICAL, HIGH (mapped to ERROR in Falco), WARNING, NOTICE.

---

## Testing Rules in Dry-Run Mode

```bash
# Test a specific rule file without deploying
falco --simulate \
  -r /etc/falco/falco_rules.yaml \
  -r platform/security/falco/rules/kcm-custom-rules.yaml \
  --list | grep "KCM"
```
