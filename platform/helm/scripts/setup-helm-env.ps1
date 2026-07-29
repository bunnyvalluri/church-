# Helm Environment Setup Script for Windows PowerShell
# Kingdom of Christ Ministries (KCM Church)

Param(
    [string]$HelmVersion = "v3.15.2",
    [string]$RegistryHost = "ghcr.io",
    [string]$RegistryUser = "bunnyvalluri"
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "KCM Church Enterprise Helm Setup & Initialization" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Verify Helm CLI Installation
if (Get-Command helm -ErrorAction SilentlyContinue) {
    $installedVer = (helm version --short)
    Write-Host "[OK] Helm CLI detected: $installedVer" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Helm CLI not found in PATH. Please install Helm $HelmVersion via Choco/Winget." -ForegroundColor Yellow
}

# 2. Install Standard Helm Plugins
Write-Host "`n[INFO] Installing required Helm plugins..." -ForegroundColor Yellow
$plugins = @(
    "https://github.com/databus23/helm-diff",
    "https://github.com/helm-unittest/helm-unittest",
    "https://github.com/jkramer/helm-checkbox",
    "https://github.com/futuresimple/helm-secrets"
)

foreach ($plugin in $plugins) {
    Write-Host "Installing/updating plugin: $plugin" -ForegroundColor Gray
    helm plugin install $plugin 2>$null
}

Write-Host "[OK] Installed Helm plugins:" -ForegroundColor Green
helm plugin list

# 3. Configure Official Remote Repositories
Write-Host "`n[INFO] Configuring official Helm repositories..." -ForegroundColor Yellow
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

# 4. OCI Registry Login Notice
Write-Host "`n[INFO] OCI Registry authentication notice:" -ForegroundColor Yellow
Write-Host "To authenticate with GitHub Container Registry (GHCR):" -ForegroundColor White
Write-Host "  $env:GHCR_PAT | helm registry login $RegistryHost -u $RegistryUser --password-stdin" -ForegroundColor White
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "Helm Setup Completed Successfully!" -ForegroundColor Green
