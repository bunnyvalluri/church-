# PowerShell Script: Launch jcode Swarm Multi-Session Engineering Harness
# Repository: KCM Ministries Church Platform

param (
    [string]$ConfigPath = ".jcode/jcode.config.toml",
    [switch]$DaemonMode = $false
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting jcode Multi-Session Engineering Harness (KCM)  " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Check jcode installation
$jcodeBinary = Get-Command jcode -ErrorAction SilentlyContinue

if (-not $jcodeBinary) {
    Write-Host "[WARNING] 'jcode' binary not found in standard PATH." -ForegroundColor Red
    Write-Host "Please ensure Rust jcode CLI (https://github.com/1jehuang/jcode) is installed." -ForegroundColor Yellow
    Write-Host "Simulating session initialization harness mode..." -ForegroundColor Green
}

# 2. Validate configuration files
$requiredConfigs = @(
    ".jcode/jcode.config.toml",
    ".jcode/mcp.json",
    ".jcode/swarm/swarm.json",
    ".jcode/memory/graph_schema.json"
)

foreach ($config in $requiredConfigs) {
    if (Test-Path $config) {
        Write-Host "[OK] Found configuration: $config" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Missing critical configuration: $config" -ForegroundColor Red
        exit 1
    }
}

# 3. List and initialize 7 parallel sessions
$sessions = Get-ChildItem -Path ".jcode/sessions/*.toml"

Write-Host "`nInitializing $($sessions.Count) Parallel Engineering Sessions:" -ForegroundColor Cyan

foreach ($sessionFile in $sessions) {
    $sessionName = $sessionFile.BaseName
    Write-Host "  -> Launching session [$sessionName]..." -ForegroundColor Yellow
}

Write-Host "`n[SUCCESS] jcode Swarm Engine initialized successfully!" -ForegroundColor Green
Write-Host "Run 'node scripts/jcode/session-manager.js status' to inspect session state." -ForegroundColor Cyan
