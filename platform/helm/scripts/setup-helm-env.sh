#!/usr/bin/env bash
# Helm Environment Setup Script for Linux/macOS
# Kingdom of Christ Ministries (KCM Church)

set -euo pipefail

REGISTRY_HOST="${REGISTRY_HOST:-ghcr.io}"
REGISTRY_USER="${REGISTRY_USER:-bunnyvalluri}"

echo -e "\033[0;36m====================================================\033[0m"
echo -e "\033[0;36mKCM Church Enterprise Helm Setup & Initialization\033[0m"
echo -e "\033[0;36m====================================================\033[0m"

# 1. Verify Helm CLI
if command -v helm &>/dev/null; then
    echo -e "\033[0;32m[OK] Helm CLI detected: $(helm version --short)\033[0m"
else
    echo -e "\033[0;31m[ERROR] Helm CLI is not installed. Please install Helm v3.15+.\033[0m"
    exit 1
fi

# 2. Helm Plugins
echo -e "\n\033[0;33m[INFO] Installing Helm plugins...\033[0m"
helm plugin install https://github.com/databus23/helm-diff || true
helm plugin install https://github.com/helm-unittest/helm-unittest || true
helm plugin install https://github.com/futuresimple/helm-secrets || true

echo -e "\033[0;32m[OK] Active Helm plugins:\033[0m"
helm plugin list

# 3. Add Repositories
echo -e "\n\033[0;33m[INFO] Registering Helm repositories...\033[0m"
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add cloudnative-pg https://cloudnative-pg.github.io/charts
helm repo add longhorn https://longhorn.github.io/charts
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo add aqua https://aquasecurity.github.io/helm-charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 4. OCI Check
if [ -n "${GHCR_PAT:-}" ]; then
    echo "${GHCR_PAT}" | helm registry login "${REGISTRY_HOST}" -u "${REGISTRY_USER}" --password-stdin
    echo -e "\033[0;32m[OK] Successfully authenticated to ${REGISTRY_HOST}\033[0m"
else
    echo -e "\033[0;33m[NOTICE] GHCR_PAT environment variable not set. Skipping OCI login.\033[0m"
fi

echo -e "\033[0;32mHelm setup completed!\033[0m"
