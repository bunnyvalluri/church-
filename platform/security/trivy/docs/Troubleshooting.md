# Troubleshooting Guide: KCM Trivy Platform

## Common Issues & Solutions

### 1. Trivy DB Download Timeout / Rate Limit
**Symptom**: Pod logs contain `failed to download vulnerability DB: rate limit exceeded` or `timeout`.
**Solution**:
- Ensure egress access to `ghcr.io/aquasecurity/trivy-db`.
- Configure GHCR GitHub token in `trivy-operator-config` ConfigMap under `trivy.githubToken`.

### 2. Scan Pods Crashing with OOMKilled
**Symptom**: `kubectl get pods -n trivy-system` shows `OOMKilled` on scan jobs.
**Solution**: Increase memory limits in Helm `values.yaml`:
```yaml
trivy:
  resources:
    limits:
      memory: "2Gi"
```

### 3. False Positive Vulnerabilities
**Symptom**: Trivy flags CVEs on deprecated or unused build tools.
**Solution**: Add CVE ID to `.trivyignore` with explicit business justification comment.
