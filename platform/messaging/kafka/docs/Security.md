# Kafka Security, Authentication, Authorization & Encryption

## Security Architecture Matrix
1. **In-Transit Encryption**: All communication endpoints enforce TLS 1.3 encryption. Broker certificates are issued by `cert-manager` (`kcm-ca-issuer`).
2. **Authentication**: `SASL/SCRAM-SHA-512` authentication is mandatory for all clients and inter-broker communication.
3. **Authorization & ACLs**: Strict ACLs restrict services to read or write permissions only on assigned topics.
4. **Secret Storage**: Credentials stored in Kubernetes Secrets and managed via OpenTofu.
