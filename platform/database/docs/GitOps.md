# GitOps Architecture & Argo CD Integration

## Overview
All database platform state is versioned in Git and reconciled automatically via Argo CD Application `kcm-database-platform`.

Features:
- `selfHeal: true`
- `prune: true`
- Automated Sync Policy
