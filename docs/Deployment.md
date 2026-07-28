# Continuous Integration & Deployment Guide

## 1. Automated Pipeline Stages

Every commit to `main` executes `.github/workflows/gitops-pipeline.yml`:

```
[Lint & TypeCheck] -> [Trivy Security Scan] -> [Multi-Arch Buildx] -> [GHCR Push] -> [Sign Image] -> [Promote Tag to GitOps]
```

---

## 2. Automated GitOps Promotion

1. Developer pushes code to `main` branch of `kcm-church-app`.
2. GitHub Actions builds and tags container image with `github.sha` (e.g. `ghcr.io/bunnyvalluri/kcm-frontend:a1b2c3d4`).
3. GitHub Actions pushes container image to GitHub Container Registry.
4. Pipeline updates `tag` in `kcm-church-infra/charts/kcm-frontend/values.yaml` and commits back to `kcm-church-infra`.
5. Argo CD detects automated Git commit, validates sync windows, and executes zero-downtime rolling update or canary rollout.
