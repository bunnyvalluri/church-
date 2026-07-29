# Storage Security Architecture & Hardening

## Hardening Controls

### 1. Role-Based Access Control (RBAC)
Longhorn UI and API endpoints are restricted to platform cluster administrators via Kubernetes RBAC and Ingress OAuth/OIDC authentication.

### 2. Encrypted Storage at Rest (LUKS)
The `longhorn-crypto` StorageClass leverages Linux LUKS encryption. Encryption keys are managed via Kubernetes Secrets or external KMS (HashiCorp Vault). Data on physical disks is completely unreadable without valid passphrase secrets.

### 3. Network Isolation & Policies
- Longhorn Manager and Engine communication is constrained within the `longhorn-system` namespace.
- Ingress is enforcing TLS 1.3 encryption with automatic certificates issued by cert-manager.

### 4. Pod Security Standards (PSS)
Longhorn system components run with explicitly defined security contexts under `privileged` policy required for block device mounting while user workloads run under `restricted` security profiles.
