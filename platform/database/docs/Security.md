# Database Security & Compliance Model

## Features
- **TLS Encryption**: In-transit TLS 1.3 encryption between applications, PgBouncer, and PostgreSQL.
- **Least Privilege RBAC**: ServiceAccounts restricted to required namespace bounds.
- **Secrets Management**: Credentials injected via Kubernetes Secrets mounted into memory (`tmpfs`).
- **Network Isolation**: `NetworkPolicy` blocking non-backend pod ingress.
