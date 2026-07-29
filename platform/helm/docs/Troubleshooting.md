# Helm Troubleshooting & Diagnostic Guide

## 1. Common Helm Error Patterns

### Issue 1: Release Stuck in `pending-upgrade`
**Solution**:
```bash
# Delete pending release secret
kubectl delete secret -n kcm-production -l owner=helm,name=backend,status=pending-upgrade
```

### Issue 2: CRD Version Mismatch
**Solution**:
```bash
# Update CRDs manually if not updated by hook
kubectl apply -f platform/helm/charts/<chart>/crds/
```
