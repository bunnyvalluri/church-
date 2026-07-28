# Production Zero-Downtime Rollback Guide

## 1. Automatic Rollback Mechanics

### Argo Rollouts Automated Rollback
When deploying via `rollout-frontend.yaml`, Argo Rollouts executes continuous Prometheus metric analysis during canary steps. If the 5xx HTTP error rate exceeds **1%**, the rollout is automatically aborted and traffic reverts 100% to the stable revision within seconds.

---

## 2. Manual Emergency Rollback via Argo CD UI / CLI

### Method 1: Using Argo CD CLI
```bash
# Rollback application to previous synced Git commit revision
argocd app rollback kcm-frontend-prod

# Rollback backend to specific revision
argocd app rollback kcm-backend-prod <revision-number>
```

### Method 2: Git Revert (GitOps Best Practice)
To maintain single source of truth in Git:
```bash
cd kcm-church-infra
git revert HEAD
git push origin main
```
Argo CD immediately reconciles the cluster state to match the reverted Git commit.
