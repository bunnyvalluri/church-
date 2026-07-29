# Infrastructure-as-Code with OpenTofu

## OpenTofu Module Overview
The S3 backup infrastructure is provisioned using OpenTofu IaC modules in `platform/backup/velero/opentofu/`.

## Executing OpenTofu

```bash
cd platform/backup/velero/opentofu

# Format & Init
tofu fmt
tofu init

# Plan & Apply
tofu plan -var-file=terraform.tfvars
tofu apply -var-file=terraform.tfvars
```
