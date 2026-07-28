# Enterprise Argo CD Operations & Configuration Guide

## 1. Official Installation Source

Argo CD is installed from the official upstream production manifests (`argo-cd/manifests/ha/install.yaml`) without modifying core binaries or maintaining forks.

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f kcm-church-infra/argocd/installation/ha-install.yaml
```

---

## 2. High Availability Architecture

The Argo CD deployment features full component redundancy:
- **Argo CD Server**: 3 Replicas behind NGINX Ingress with TLS passthrough.
- **Repo Server**: 3 Replicas for scalable Git clone and manifest generation.
- **Application Controller**: 2 Replicas operating in HA HA shard mode.
- **Redis HA**: Sentinel-backed cache cluster.

---

## 3. Argo CD RBAC Model

Argo CD enforces fine-grained Role-Based Access Control mapped to team duties:

| Role | Application Scope | Allowed Operations | Assigned Groups |
|---|---|---|---|
| `role:org-admin` | All (`*/*`) | All (`*`) | `kcm:platform-admins` |
| `role:devops` | All (`*/*`) | Sync, Override, Exec, Logs | `kcm:devops-engineers` |
| `role:developer` | `frontend/*`, `backend/*` | Read Logs, Manual Sync | `kcm:developers` |
| `role:readonly` | All (`*/*`) | Read-only view (`get`) | Default fallback |

---

## 4. App-of-Apps Pattern

Argo CD manages all platform components using a single Root Application (`root-application.yaml`):

```bash
kubectl apply -f kcm-church-infra/argocd/applications/root-application.yaml
```

When applied, the Root Application scans `kcm-church-infra/argocd/applications/` and automatically provisions:
1. `kcm-frontend-prod`
2. `kcm-backend-prod`
3. `kcm-database-prod`
4. `kcm-monitoring-prod`
