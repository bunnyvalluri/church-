# GitOps Integration & Principles Guide

## 1. Overview
The platform enforces a pure GitOps model:
- No manual `helm install` or `kubectl apply` commands in production.
- Every state change is committed to the Git repository.
- Argo CD reconciles cluster state automatically.
