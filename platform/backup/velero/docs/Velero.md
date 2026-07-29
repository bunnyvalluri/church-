# Official Velero Integration & Compliance

## Repository Standards
The platform strictly consumes official upstream release artifacts from:
- **Repository**: [velero-io/velero](https://github.com/velero-io/velero)
- **Official Helm Chart**: `vmware-tanzu/velero`
- **Release Version**: `v1.14.0`
- **No Modifications Policy**: Velero codebase is used strictly as an immutable platform dependency. Customization is achieved via custom CRDs, Helm value overrides, plugins, and OpenTofu infrastructure provisioning.

## Official Plugins Used
1. **`velero/velero-plugin-for-aws:v1.10.0`**: Provides native AWS S3 storage backend and EBS volume snapshot integrations.
2. **`velero/velero-plugin-for-csi:v0.8.0`**: Enables standard Kubernetes CSI `VolumeSnapshot` APIs across all supported storage drivers.
