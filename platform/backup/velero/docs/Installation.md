# Velero Installation & Deployment Guide

## Overview
This guide documents the automated deployment of Velero in the KCM Church Kubernetes cluster using Helm and Argo CD.

## Prerequisites
1. OpenTofu provisioning of S3 buckets and KMS keys completed (see [OpenTofu.md](file:///c:/K.C.M-Portal/platform/backup/velero/docs/OpenTofu.md)).
2. Kubernetes namespace `velero` created with `velero-s3-credentials` secret.

## Manual Installation (Helm CLI)

```bash
# Add VMware Tanzu Official Helm Repository
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo update

# Install/Upgrade Velero release
helm upgrade --install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  -f platform/backup/velero/helm/values.yaml
```

## GitOps Automated Installation (Argo CD)

Apply the Argo CD application manifest:

```bash
kubectl apply -f platform/backup/velero/argocd/argocd-velero-app.yaml
kubectl apply -f platform/backup/velero/argocd/argocd-velero-schedules-app.yaml
```
