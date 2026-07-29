# Longhorn Installation Guide

## Node Prerequisites
Prior to installing Longhorn, every Kubernetes worker node must satisfy system requirements:

1. **Kernel Modules & Packages**:
   - `open-iscsi` / `iscsiadm` installed and daemon running.
   - `nfs-common` / `nfs-utils` installed for RWX volume support.
   - `util-linux` for filesystem tools (`cryptsetup` if using encrypted volumes).

```bash
# Ubuntu / Debian
sudo apt-get update && sudo apt-get install -y open-iscsi nfs-common util-linux cryptsetup

# RHEL / Rocky Linux
sudo dnf install -y iscsi-initiator-utils nfs-utils util-linux cryptsetup
```

2. **Environment Check Script**:
   Run the official Longhorn node check script:
   ```bash
   curl -sSfL https://raw.githubusercontent.com/longhorn/longhorn/v1.6.2/scripts/environment_check.sh | bash
   ```

---

## Helm Installation Command
```bash
helm repo add longhorn https://charts.longhorn.io
helm repo update

helm upgrade --install longhorn longhorn/longhorn \
  --namespace longhorn-system \
  --create-namespace \
  --values platform/storage/longhorn/helm/values.yaml
```
