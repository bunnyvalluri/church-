# Incident Response & Disaster Recovery Playbook

## Severity Levels

- **SEV-1 (Critical)**: Active data leak, complete platform outage, payment double-charging, database failure.
- **SEV-2 (High)**: Core feature outage (sermon playback broken, 80G receipt generation failed), partial API latency spike.
- **SEV-3 (Medium)**: Minor UI cosmetic defect, translation typo, non-critical background job delay.

---

## 1. Secret Exposure Runbook
1. **Revoke & Rotate**: Immediately rotate exposed credentials in Neon / Vercel / Cloudinary / Razorpay dashboards.
2. **Deploy**: Update environment variables in Vercel / Kubernetes and trigger immediate zero-downtime redeploy.
3. **Audit History**: Inspect access logs around the credential's timeframe to detect unauthorized requests.

---

## 2. Database Disaster Recovery
1. **Neon Point-in-Time Restore (PITR)**: Restore Neon PostgreSQL branch to any second in the past 7-30 days via Neon console or API.
2. **CloudNativePG Automated Backup**: Retrieve continuous WAL archives and base backups from object storage using Barman / Velero.
