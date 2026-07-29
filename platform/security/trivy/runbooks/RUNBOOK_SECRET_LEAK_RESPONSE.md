# Operational Runbook: Secret Leak Response & Credential Rotation

## Objective
Provide emergency response steps when Trivy identifies a hardcoded secret, token, or private key in application code, manifests, or cluster state.

---

## Emergency Action Protocol (SLA: 15 Minutes)

### Step 1: Revoke Compromised Credential
Immediately invalidate the leaked credential at the provider level:
- **Firebase Private Key**: Revoke Service Account key in Firebase Console -> IAM & Admin.
- **Database Connection String**: Rotate PostgreSQL user password via CloudNativePG operator or SQL alter role.
- **Cloudinary Secret**: Regenerate API Secret in Cloudinary Dashboard.

### Step 2: Remove Leaked Secret from Git History
Use `git-filter-repo` or BFG Repo-Cleaner to purge the file containing the secret from Git history:
```bash
git filter-repo --invert-paths --path path/to/leaked-config.env
git push origin --force --all
```

### Step 3: Trigger Immediate Security Re-Scan
Run local Trivy scan to confirm clean state:
```bash
trivy fs --security-checks secret .
```
