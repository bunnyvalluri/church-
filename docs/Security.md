# Enterprise Security Architecture & Compliance Guide

## 1. Security Architecture Layers

```
 [Trivy Vulnerability Scan] ──► [Cosign Image Signature] ──► [Pod Security Standards] ──► [NetworkPolicies]
```

1. **Supply Chain Security**:
   - Container images scanned for CRITICAL/HIGH vulnerabilities via Trivy in CI.
   - Images signed using `Cosign` public/private keys before pushing to GHCR.
2. **Runtime Security**:
   - Pod Security Admission enforcing `restricted` level on `kcm-prod`.
   - Containers run as non-root (`uid: 1001`), dropping all Linux capabilities (`capabilities.drop: ["ALL"]`).
   - Read-only root filesystems where applicable.
3. **Network Microsegmentation**:
   - Default-Deny-All NetworkPolicies isolating pods.
   - Explicit ingress/egress allow rules (Frontend -> Backend, Backend -> Postgres/Redis).
4. **Secrets Management**:
   - Zero plaintext secrets stored in repository.
   - Integration with ExternalSecrets Operator / SealedSecrets.
5. **TLS Certificate Management**:
   - Automated TLS certificate issuance and renewal via `cert-manager` Let's Encrypt ClusterIssuer.
