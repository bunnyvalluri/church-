# NATS & JetStream Enterprise Best Practices Guide

## 1. Subject Naming Standards
- Always use lowercase alphanumeric tokens separated by periods (`.`).
- Use wildcards (`*` for single token, `>` for multi-token) conservatively in subscriber rules.
- Include event source and entity name in subject hierarchy.

## 2. JetStream Stream Architecture
- **Use WorkQueue retention for background task queues** (Email, SMS, Push, Video Transcode) so messages are deleted immediately after acknowledgment.
- **Use Limits retention for domain event audit streams** with explicit `maxAge` retention limits.
- Set `duplicateWindow` to 2-5 minutes and pass unique `Nats-Msg-Id` headers to prevent message duplicate processing.

## 3. Security & Account Isolation
- Never expose NATS server ports without TLS 1.3 encryption.
- Enforce strict ACLs per account (`KCM_APP`, `KCM_ADMIN`).
- Store NKEY credentials and TLS secrets securely in Kubernetes Secrets / Vault.

## 4. Client SDK Best Practices
- Reuse a single global `NatsConnection` singleton instance across your Node.js application lifecycle.
- Always handle graceful shutdown by calling `nc.drain()` before application termination.
- Set `maxReconnectAttempts: -1` to allow infinite client auto-reconnection backoff.
