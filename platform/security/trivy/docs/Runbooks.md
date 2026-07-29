# Operational Runbooks Overview

## Overview
Operational runbooks located in `platform/security/trivy/runbooks/` govern incident response, vulnerability triage, credential rotation, and maintenance procedures.

---

## 1. Runbook Catalog

| Runbook File | Primary Objective | SLA |
| :--- | :--- | :--- |
| `RUNBOOK_VULNERABILITY_TRIAGE.md` | Triage Critical/High CVEs and manage VEX exceptions | 4 Hours (Critical) / 24 Hours (High) |
| `RUNBOOK_SECRET_LEAK_RESPONSE.md` | Emergency response for leaked API keys or credentials | 15 Minutes |
| `RUNBOOK_TRIVY_OPERATOR_MAINTENANCE.md` | Database updates, resource limits, and cache tuning | As Needed |
