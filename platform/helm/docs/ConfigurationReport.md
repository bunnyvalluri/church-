# Configuration Management Report - Kingdom of Christ Ministries (KCM Church)

## 1. Executive Summary
This report establishes the configuration hierarchy, parameter override standards, secret management integration, resource management, and autoscaling policies for the KCM Church Helm platform.

---

## 2. Configuration Hierarchy

Chart configurations follow a strict 4-tier precedence hierarchy:

```
[Tier 4: Helm CLI --set Overrides (CI/CD Runtime)]
        ↓ (overrides)
[Tier 3: Environment Overrides (values-production.yaml / values-staging.yaml)]
        ↓ (overrides)
[Tier 2: Global Values File (values-global.yaml)]
        ↓ (overrides)
[Tier 1: Chart Default Values (values.yaml inside chart)]
```

---

## 3. Environment Overrides Architecture

| Environment | Key Values File | Replica Target | Resource Strategy | Storage Class |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | `values-production.yaml` | Min 3, Max 10 (HPA) | High (1-2 CPU, 2-4GB RAM) | `longhorn-crypto` / `longhorn-fast` |
| **Staging** | `values-staging.yaml` | Min 2, Max 4 (HPA) | Medium (500m CPU, 1GB RAM) | `longhorn` |
| **Development** | `values-development.yaml` | Min 1, Max 1 | Low (100m CPU, 256MB RAM) | `longhorn` |

---

## 4. Resource Allocation & Autoscaling Standard

All Pod templates rendered by KCM Church Helm charts enforce explicit resource requests & limits and horizontal pod autoscalers (HPA):

```yaml
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1024Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 75
  targetMemoryUtilizationPercentage: 80
```

---

## 5. Security & Node Placement Policies

All charts implement default pod security context and node scheduling constraints:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL

nodeSelector:
  topology.kubernetes.io/zone: "us-east-1a"

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                  - backend
          topologyKey: "kubernetes.io/hostname"
```
