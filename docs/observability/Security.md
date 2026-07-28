# Observability Security Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## Security Controls Overview

1. **Transport Layer Security (TLS)**: All Grafana web interface and API traffic is encrypted via HTTPS with TLS 1.3 certificates managed by `cert-manager` (`letsencrypt-prod`).
2. **Kubernetes Least Privilege RBAC**: ServiceAccount `grafana-sa` bound to read-only `ClusterRole` permissions (`get`, `list`, `watch`).
3. **Network Isolation**: Kubernetes `NetworkPolicy` (`monitoring/kubernetes/network-policy.yaml`) strictly restricts ingress to NGINX Ingress controller and egress to telemetry datasources.
4. **Non-Root Container Execution**: SecurityContext enforces `runAsNonRoot: true` with user/group ID `472`.
5. **Session & Password Hygiene**: Admin credentials stored in Kubernetes `Secret` (`grafana-secret`). Sessions stored securely in Redis with `cookie_secure: true`.
