# Operational Runbook: Trivy Operator Maintenance & Troubleshooting

## Objective
Maintain health, DB updates, and performance tuning of the Trivy Operator in the `trivy-system` namespace.

---

## 1. Trivy Vulnerability DB Mirror Maintenance
Trivy updates its vulnerability database (`ghcr.io/aquasecurity/trivy-db`) twice daily.

### Database Update Failure Troubleshooting
If pods report `Failed to download Trivy DB`:
1. Check egress network access to `ghcr.io`.
2. Inspect Operator logs:
```bash
kubectl logs -n trivy-system deployment/trivy-operator -f
```
3. Reset local cache if corrupted:
```bash
kubectl rollout restart deployment/trivy-operator -n trivy-system
```

## 2. Resource Limit Tuning
If Trivy Operator scan jobs crash with `OOMKilled`:
Edit ConfigMap `trivy-operator-config`:
```yaml
trivy.resources.limits.memory: "2Gi"
```
Then restart operator deployment.
