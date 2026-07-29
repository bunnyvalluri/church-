# Enterprise NATS Security Architecture & Hardening Guide

## Security Standards Compliance
The KCM Messaging Platform enforces zero-trust security controls across network transport, authentication, authorization, and storage.

## 1. Network Transport Encryption (TLS 1.3)
- TLS is strictly enforced for all client-to-server and server-to-server cluster traffic.
- X.509 Certificates are automatically issued and renewed by `cert-manager` using the `kcm-cluster-issuer`.
- Cipher suites restricted to modern TLS 1.3 curve standards (`TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`).

## 2. Authentication Architecture
- **NKEY & Password Hashes**: Users authenticate via Ed25519 NKEY signatures or bcrypt hashed secrets stored in Kubernetes Secrets.
- **Account Isolation**:
  - `KCM_APP`: Isolated account for application services and background workers.
  - `KCM_ADMIN`: Privileged administrative account for cluster monitoring and management.

## 3. Authorization & Least Privilege ACLs
Subject permissions are restricted by domain:
- `kcm_api_service`: Allowed publish/subscribe ONLY on `*.events.>` and `$JS.API.>`.
- `kcm_worker`: Allowed subscribe ONLY on designated job queues (`email.jobs.>`, `sms.jobs.>`).
