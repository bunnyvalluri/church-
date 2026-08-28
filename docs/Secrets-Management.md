# Secrets Management & Key Lifecycle Architecture

## Purpose
This document specifies the secrets management architecture, encryption-at-rest standards, Kubernetes secret injection, automated scanning, and credential rotation procedures for the Kingdom of Christ Ministries platform.

## Scope
Covers database passwords, API credentials, payment gateway keys, webhook signing secrets, and SSL/TLS private keys.

## Status
> Status: Implemented

---

## 1. Secrets Management Architecture

```mermaid
graph TD
    subgraph Secret Injection Pipelines
        Vault[(Secure Cloud Secret Manager: GCP / HashiCorp Vault)] --> ExternalSecrets[External Secrets Operator]
        ExternalSecrets --> K8sSecret[Kubernetes Secret: kcm-system]
    end

    subgraph Workload Consumption
        K8sSecret -->|Env Injection: envFrom.secretRef| FrontendPod[Frontend Pods]
        K8sSecret -->|Env Injection: envFrom.secretRef| BackendPod[Backend Pods]
        K8sSecret -->|Volume Mount: /etc/secrets| DBCluster[CloudNativePG Database Pods]
    end

    subgraph Automated Leak Detection & Scanning
        GitCommit[Developer Git Commit] --> TrivyScan[Trivy Pre-Commit & CI Secret Scan]
        TrivyScan -->|Flag Leaked Key| BlockMerge[Block Merge & Alert Security Team]
    end
```

---

## 2. Kubernetes Secret Specification (`k8s/secret.yaml`)

Production secrets are defined declaratively and injected as environment variables:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kcm-frontend-secrets
  namespace: kcm-system
type: Opaque
stringData:
  DATABASE_URL: "postgresql://kcm_app:StrongSecretPassword@kcm-db-pooler:5432/church_db?sslmode=require"
  MONGODB_URI: "mongodb+srv://kcm_app:StrongSecretPassword@cluster0.mongodb.net/kcm_church"
  NEXTAUTH_SECRET: "32_character_random_hex_string_here"
  RAZORPAY_KEY_SECRET: "razorpay_secret_key_here"
  STRIPE_SECRET_KEY: "stripe_secret_key_here"
  RESEND_API_KEY: "resend_api_key_here"
  GEMINI_API_KEY: "gemini_api_key_here"
  INTERNAL_SERVICE_TOKEN: "internal_bearer_token_here"
```

---

## 3. Credential Rotation Schedule

| Secret Category | Rotation Interval | Automation Mechanism |
| :--- | :---: | :--- |
| **Database Application Passwords** | `90 Days` | CloudNativePG operator password rotation |
| **Payment Gateway Secrets** | `180 Days` | Manual dual-key rotation via Razorpay / Stripe dashboard |
| **API Keys (Resend, Gemini, httpSMS)**| `90 Days` | Provider API console key recreation |
| **Kubernetes Service Account Tokens** | `30 Days` | Automated kube-controller-manager token rotation |
| **Let's Encrypt TLS Certificates** | `60 Days` | Automated cert-manager ACME challenge renewal |

---

## 4. Emergency Secret Leak Response Runbook

If any production key or secret is accidentally committed to Git or exposed:
1. **Immediate Revocation**: Log in to the provider dashboard (e.g. Razorpay, Resend, Cloudinary) and immediately revoke the exposed key.
2. **Generate Replacement**: Generate a fresh replacement key.
3. **Update Kubernetes Secret**: Update the Kubernetes secret via `kubectl apply -f k8s/secret.yaml` or through the External Secrets store.
4. **Rollout Restart**: Restart all dependent application deployments:
   ```bash
   kubectl rollout restart deployment kcm-frontend kcm-backend -n kcm-system
   ```
5. **Git History Scrubbing**: Use `git-filter-repo` or BFG Repo-Cleaner to permanently purge the exposed commit from Git history and force-push sanitized branches.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Application crashes on startup with `Missing secret` | Secret key name in `k8s/secret.yaml` does not match environment variable expected by code | Cross-reference variable name against [Environment-Variables.md](Environment-Variables.md). |
| Secret base64 decoding error in container | Double-encoded base64 string provided in `data` field | Use `stringData` instead of `data` in Kubernetes Secret manifests to allow Kubernetes to handle base64 encoding automatically. |

---

## Security Considerations
- Zero plaintext production secrets exist in the Git repository.
- Secrets are stored in encrypted etcd persistent storage with AES-CBC or KMS envelope encryption.

## Related Documentation
- [Environment-Variables.md](Environment-Variables.md) — Complete environment catalog.
- [Security.md](Security.md) — Overall security architecture.
- [Trivy.md](Trivy.md) — Automated secret scanning in CI/CD.
