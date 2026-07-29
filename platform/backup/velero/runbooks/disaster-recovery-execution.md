# Runbook: Total Kubernetes Cluster Disaster Recovery Execution

## Target RTO / RPO
- **RTO (Recovery Time Objective)**: < 4 Hours
- **RPO (Recovery Point Objective)**: < 1 Hour (Hourly Critical), < 24 Hours (Full Cluster)

---

## 1. Prerequisites for Recovery Cluster

1. Target Kubernetes Cluster provisioned and accessible via `kubectl`.
2. Cert-Manager, Gateway API / Envoy Gateway, and Argo CD installed.
3. Velero CLI installed on administrator machine (`velero v1.14.0`).

---

## 2. Deploy Velero Server on New Cluster

```bash
# Install Velero referencing existing primary S3 bucket in Read-Only mode initial state
helm upgrade --install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  -f platform/backup/velero/helm/values.yaml
```

---

## 3. Verify S3 Backups Discovery

```bash
# Verify that Velero detects all historical backups stored in S3
velero backup get
```

---

## 4. Execute Full Cluster Recovery

```bash
# Apply cross-cluster restore specification
kubectl apply -f platform/backup/velero/restore/restore-cross-cluster.yaml

# Monitor restore progress
velero restore get
velero restore describe kcm-cross-cluster-migration-restore --details
velero restore logs kcm-cross-cluster-migration-restore
```

---

## 5. Post-Restore Verification & Sanity Checks

1. Verify CloudNativePG database clusters:
   ```bash
   kubectl get cluster -n kcm-database
   ```
2. Verify Redis and application deployments:
   ```bash
   kubectl get pods -n kcm-app
   kubectl get pods -n kcm-cache
   ```
3. Run automated restore validation job:
   ```bash
   kubectl apply -f platform/backup/velero/restore/restore-validation-job.yaml
   ```
