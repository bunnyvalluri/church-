# Official Longhorn Project Integration

## Source & Versioning
- **Official Repository**: `https://github.com/longhorn/longhorn.git`
- **Release Version**: `v1.6.2` (Latest Stable Production Release)
- **License**: Apache 2.0
- **Policy**: Strictly un-forked, zero source modifications, 100% upstream standard Helm deployment.

---

## Core Components Overview
1. **Longhorn Manager**: Kubernetes DaemonSet orchestrating volumes, CRDs, and CSI controllers.
2. **Longhorn Engine**: Controller process spawned per volume running in user-space for zero kernel dependency.
3. **Instance Manager**: Engine/Replica process manager daemon handling block device lifecycle.
4. **CSI Plugin**: Official CSI Driver (Attacher, Provisioner, Resizer, Snapshotter).
5. **Backing Image Manager**: Manages base layer backing image downloads and sharing.
6. **Share Manager**: Provides NFS/ReadWriteMany (RWX) volume export for multi-pod file sharing.
