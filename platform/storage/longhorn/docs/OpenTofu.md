# OpenTofu Module Documentation

## Purpose
The OpenTofu module under `platform/storage/longhorn/opentofu/` automates the provisioning of AWS S3 backup targets, Kubernetes namespaces, Helm releases, StorageClasses, and Prometheus monitoring resources.

---

## Usage Example

```hcl
module "longhorn_storage" {
  source                  = "platform/storage/longhorn/opentofu"
  kubeconfig_path         = "~/.kube/config"
  aws_region              = "us-east-1"
  backup_target_bucket    = "kcm-church-longhorn-backups"
  replica_count           = 3
  longhorn_chart_version  = "1.6.2"
}
```

---

## Commands
```bash
cd platform/storage/longhorn/opentofu
tofu init
tofu plan
tofu apply
```
