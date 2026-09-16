# KCM Platform — Incident Response Runbook

---

## 1. Incident Severity Classification

- **SEV-1 (CRITICAL)**: Primary PostgreSQL database unreachable, payment verification offline, auth bypass detected.
- **SEV-2 (HIGH)**: Realtime websocket cluster offline, SMS delivery failed, donation gateway degraded.
- **SEV-3 (MEDIUM)**: Non-critical page error, cosmetic styling mismatch, non-blocking telemetry alert.

---

## 2. Escalation & Remediation Steps

1. Check `/admin/system-health` for affected subsystem.
2. Inspect application error logs via `/admin/support/reports`.
3. Run diagnostic health engine: `npx tsx health/cli/health.ts`.
4. Deploy emergency hotfix through GitHub Actions quality gates.
