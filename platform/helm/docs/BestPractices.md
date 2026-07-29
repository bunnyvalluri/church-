# Enterprise Helm Best Practices Guide

## 1. Governance Rules
1. **Never mutate deployed manifests directly** with `kubectl edit`. Always update `values.yaml` in Git.
2. **Always pin chart dependencies** to explicit semantic versions.
3. **Enforce non-root security contexts** across all pod templates.
4. **Use OCI registry** (`ghcr.io`) for immutable chart distribution.
5. **Enforce Cosign signature verification** in CI/CD pipelines before deployment.
