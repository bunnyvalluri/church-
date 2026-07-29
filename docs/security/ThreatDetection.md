# Threat Detection Reference
## Kingdom of Christ Ministries — Runtime Security

## Threat Categories

### Category 1: Process & Execution Threats

| Threat | Falco Rule | Severity | MITRE |
|---|---|---|---|
| Shell spawned in any container | `KCM Shell Spawned in Application Container` | CRITICAL | T1059 |
| Unknown binary executed | `KCM Unexpected Binary Execution` | HIGH | T1059 |
| Download tool (curl/wget) at runtime | `KCM API Download Tool Executed` | CRITICAL | T1105 |
| Hidden process (dot-prefixed) | `KCM Hidden Process Detected` | HIGH | T1036 |
| Crypto mining binary | `KCM Crypto Mining Detected` | CRITICAL | T1496 |
| Hacking tool execution | `KCM Auth API Hacking Tool Detected` | CRITICAL | T1059 |
| Prisma DB reset (destructive) | `KCM Prisma DB Reset Detected` | CRITICAL | T1485 |
| Crontab tampering | `KCM Cron System Crontab Tamper` | HIGH | T1053.003 |

### Category 2: File Access Threats

| Threat | Falco Rule | Severity | MITRE |
|---|---|---|---|
| Read `/etc/shadow` | `KCM Sensitive File Access` | CRITICAL | T1003 |
| Read `/proc/*/environ` | `KCM Auth API Credential Harvest` | CRITICAL | T1003.007 |
| Read ServiceAccount token | `KCM ServiceAccount Token Read` | HIGH | T1528 |
| Write to /tmp (suspicious) | `KCM Write to Tmp Directory` | WARNING | T1074 |
| Admin portal secrets access | `KCM Admin Portal Secrets Access` | CRITICAL | T1003 |
| Payment API secrets file | `KCM Payment API Secrets File Access` | CRITICAL | T1003 |

### Category 3: Network Threats

| Threat | Falco Rule | Severity | MITRE |
|---|---|---|---|
| Reverse shell (stdin→socket dup) | `KCM Reverse Shell Detected` | CRITICAL | T1059.004 |
| Unexpected outbound connection | `KCM Unexpected Outbound Network Connection` | HIGH | T1041 |
| Payment API external connection | `KCM Payment API Suspicious Outbound` | HIGH | T1041 |
| Large data exfiltration | `KCM Large Data Exfiltration via Socket API` | HIGH | T1048 |
| Cron unexpected network | `KCM Cron Unexpected Network Connection` | WARNING | T1041 |

### Category 4: Privilege Threats

| Threat | Falco Rule | Severity | MITRE |
|---|---|---|---|
| setuid/setgid syscall | `KCM Privilege Escalation Attempt` | CRITICAL | T1548 |
| Kernel module load | `KCM Kernel Module Load Attempt` | CRITICAL | T1547.006 |
| Container escape (proc access) | `KCM Container Escape Attempt` | CRITICAL | T1611 |
| Host process from container | `KCM Host Process From Container` | CRITICAL | T1611 |

### Category 5: Kubernetes Threats (K8s Audit Source)

| Threat | Falco Rule | Severity | MITRE |
|---|---|---|---|
| Privileged pod created | `KCM Privileged Pod Created` | CRITICAL | T1610 |
| Sensitive HostPath mount | `KCM HostPath Sensitive Mount` | CRITICAL | T1611 |
| Host network/PID/IPC pod | `KCM Host Namespace Pod Created` | CRITICAL | CIS-5.2.2 |
| kubectl exec into pod | `KCM Kubectl Exec Into Pod` | HIGH | T1609 |
| Unauthorized exec production | `KCM Unauthorized Exec Into Production Pod` | CRITICAL | T1609 |
| Secrets bulk list (dump) | `KCM Secrets Bulk List` | CRITICAL | T1552.007 |
| Secrets read by non-system | `KCM Secrets Read Audit` | HIGH | T1552.007 |
| Anonymous API access | `KCM Anonymous Kubernetes API Access` | CRITICAL | T1078.004 |
| RBAC wildcard role | `KCM RBAC Wildcard Permission Created` | CRITICAL | T1078.004 |
| ClusterRoleBinding created | `KCM ClusterRoleBinding Created` | HIGH | T1078.004 |
| Default SA API access | `KCM Default ServiceAccount API Access` | HIGH | T1528 |
| Dangerous capability pod | `KCM Dangerous Capability Pod Created` | CRITICAL | T1610 |

---

## Detection Logic

Falco operates at **Layer 0** — kernel system calls. It cannot be bypassed by:
- Process hiding (rootkits at userspace level)
- Log deletion (Falco operates independently of container logs)
- Container runtime manipulation (eBPF is in kernel space)

### Event Sources

```
1. syscall  → System calls observed via eBPF (primary source)
2. k8s_audit → Kubernetes API audit log (requires audit webhook config)
```

### Rule Evaluation

```
Event arrives → Filter by syscall type → Match conditions → 
if matched → Generate output JSON → Send to Falcosidekick → 
Falcosidekick → Loki (log) + Alertmanager (alert) + Prometheus (metric)
```

---

## Testing Detections

```bash
# Test 1: Shell in container (should trigger KCM Shell rule)
kubectl run test --image=ubuntu --rm -it --restart=Never \
  --overrides='{"spec":{"securityContext":{"runAsNonRoot":false}}}' \
  -- bash -c "echo shell_test && sleep 5"

# Test 2: Read /etc/shadow (should trigger KCM Sensitive File Access)
kubectl exec -n kcm-system deployment/kcm-backend-api -- cat /etc/shadow 2>&1 || true

# Test 3: kubectl exec (should trigger KCM Kubectl Exec Into Pod)
kubectl exec -n kcm-system deployment/kcm-backend-api -- ps aux

# Verify alerts fired
kubectl logs -n falco daemonset/falco --tail=10 | jq '.rule'
```

---

## Tuning False Positives

Edit `platform/security/falco/rules/kcm-custom-rules.yaml`:

```yaml
# Add exceptions for legitimate operations
- rule: KCM Shell Spawned in Application Container
  condition: >
    spawned_shell_in_container
    and kcm_app_container
    and not proc.pname in (kcm_trusted_processes)
    # Add your exception here:
    and not (proc.cmdline = "sh -c health_check.sh")
```

Commit → push → ArgoCD auto-syncs → Falco hot-reloads rules.
