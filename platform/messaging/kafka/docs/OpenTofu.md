# Infrastructure as Code (IaC) Specification - OpenTofu

## Module Architecture
The OpenTofu module in `platform/messaging/kafka/opentofu/` provisions the underlying Kubernetes resources:

- `main.tf`: Provider setup and `messaging` namespace creation.
- `helm.tf`: Installs `kcm-kafka` Helm chart release.
- `storage.tf`: Provisions `longhorn-kafka` StorageClass with 3 data replicas.
- `security.tf`: Provisions SASL secrets for broker authentication.

## Execution Workflow
```bash
cd platform/messaging/kafka/opentofu
tofu init
tofu plan
tofu apply
```
