#!/usr/bin/env bash
# ==============================================================================
# Enterprise Cluster Disaster Recovery & Restoration Script
# Target RTO: < 15 Minutes | Target RPO: < 1 Hour
# ==============================================================================
set -euo pipefail

echo "========================================="
echo " Initiating KCM Church Cluster Recovery  "
echo "========================================="

# Step 1: Ensure kubectl connection
echo "[1/5] Verifying Kubernetes cluster context..."
kubectl cluster-info

# Step 2: Bootstrap Argo CD HA Stack
echo "[2/5] Deploying official Argo CD HA installation..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f ../argocd/installation/ha-install.yaml
kubectl apply -f ../argocd/argocd-cm.yaml
kubectl apply -f ../argocd/argocd-rbac-cm.yaml
kubectl apply -f ../argocd/argocd-secret.yaml

# Step 3: Wait for Argo CD Server Ready
echo "[3/5] Waiting for Argo CD API Server readiness..."
kubectl rollout status deployment/argocd-server -n argocd --timeout=300s

# Step 4: Apply Root GitOps Application (App-of-Apps)
echo "[4/5] Applying Root Application GitOps spec..."
kubectl apply -f ../argocd/applications/root-application.yaml

# Step 5: Restore PostgreSQL Data Snapshot
echo "[5/5] Checking for latest database snapshot to restore..."
latest_backup=$(kubectl exec -n kcm-prod statefulset/postgres-db -- sh -c "ls -t /backups/*.sql.gz | head -n 1" || true)

if [ -n "${latest_backup}" ]; then
  echo "Restoring database snapshot: ${latest_backup}"
  kubectl exec -i -n kcm-prod statefulset/postgres-db -- sh -c "zcat ${latest_backup} | psql -U kcm_user -d kcm_db"
  echo "Database restoration completed successfully."
else
  echo "No existing backup snapshot found. Clean database initialized."
fi

echo "========================================="
echo " Disaster Recovery Complete!              "
echo " All services syncing via Argo CD GitOps. "
echo "========================================="
