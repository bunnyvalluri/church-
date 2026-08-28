# Production Security Verification Checklist

## Purpose
This document provides an exhaustive, actionable security verification checklist that must be executed prior to promoting any release to production across the Kingdom of Christ Ministries platform.

## Scope
Covers application code, databases, authentication mechanisms, Kubernetes clusters, network perimeters, container images, and secrets.

## Status
> Status: Implemented

---

## 1. Security Verification Checklist Matrix

### 1.1 Application & API Security
- [x] **Input Validation**: All API routes validate incoming request payloads with Zod schemas.
- [x] **XSS Prevention**: User-generated rich text is sanitized via `sanitize-html` before database persistence.
- [x] **SQL Injection Defense**: All database mutations execute via parameterized Prisma ORM queries.
- [x] **Rate Limiting**: `express-rate-limit` and Envoy Gateway rate limiting active on all public and auth routes.
- [x] **CORS Configuration**: Strict CORS headers restricting API access to authorized church domains.
- [x] **Security Headers**: HSTS, CSP, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`) enabled in `next.config.js`.

### 1.2 Authentication & Session Management
- [x] **Password Hashing**: Bcrypt salt rounds >= 12 configured for all user passwords.
- [x] **Session Cookies**: `kcm_session` cookies configured with `HttpOnly: true`, `Secure: true`, `SameSite: Lax`.
- [x] **Google OAuth**: Tokens verified cryptographically using `google-auth-library` server-side.
- [x] **RBAC Enforcement**: Edge middleware (`frontend/middleware.ts`) and API guards enforce role authorization boundaries.

### 1.3 Database & Storage Security
- [x] **PostgreSQL Encryption**: SSL mode enforced (`sslmode=require`) on all Prisma connection strings.
- [x] **MongoDB Access**: IP Access Lists configured on MongoDB Atlas; TLS 1.3 enforced.
- [x] **Cloudinary Storage**: API secrets strictly kept server-side; MIME validation enforced on uploads.
- [x] **Financial Data Isolation**: No raw credit card or banking secrets stored in local databases.

### 1.4 Kubernetes & Container Security
- [x] **Non-Root Execution**: Pods enforce `runAsNonRoot: true` with non-zero user IDs (`10001`).
- [x] **Read-Only Root Filesystem**: `readOnlyRootFilesystem: true` enabled; write operations restricted to `/tmp` `emptyDir`.
- [x] **Capability Dropping**: Container `capabilities.drop: ["ALL"]` configured in all deployments.
- [x] **Network Policies**: Default-deny NetworkPolicies active; ingress limited to necessary service ports.
- [x] **Runtime Detection**: Falco DaemonSet actively monitoring kernel syscalls for unauthorized shells or file writes.
- [x] **Vulnerability Scanning**: Trivy Operator scanning running workloads; no unpatched CRITICAL CVEs present.

### 1.5 Secrets & Environment Configuration
- [x] **No Plaintext Secrets**: Zero API keys or secrets committed to Git repository (verified by Trivy secret scans).
- [x] **Secret Injection**: Production secrets injected via Kubernetes Secrets or sealed secret operators.
- [x] **Webhook Signatures**: Payment and SMS webhooks verify HMAC signatures before payload processing.

---

## 2. Automated Security Audit Commands

```bash
# 1. Run Playwright RBAC security test matrix
npm run test:rbac -w frontend

# 2. Run Trivy container image scan locally
trivy image kcm-frontend:latest --severity CRITICAL,HIGH

# 3. Verify Kubernetes NetworkPolicy isolation
kubectl get networkpolicy -n kcm-system

# 4. Verify Falco DaemonSet health
kubectl get pods -n falco -l app.kubernetes.io/name=falco
```

---

## Related Documentation
- [Security.md](Security.md) — Comprehensive security architecture.
- [Runtime-Security.md](Runtime-Security.md) — Kubernetes pod hardening.
- [Falco.md](Falco.md) — Runtime anomaly monitoring.
- [Trivy.md](Trivy.md) — Image and vulnerability scanner.
