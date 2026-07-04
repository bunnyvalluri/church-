# Production Optimization Checklist

Before pushing this architecture live, ensure the following checklist is completed:

## Security
- [ ] **RBAC**: Apply Least Privilege Role-Based Access Control in the cluster.
- [ ] **Secrets Management**: Replace dummy secrets in `secret.yaml` with a robust solution (External Secrets, HashiCorp Vault, AWS Secrets Manager).
- [ ] **Network Policies**: Review the Default Deny Network Policies applied in the Helm chart. Ensure cross-namespace traffic is blocked where unnecessary.
- [ ] **Non-root Containers**: Verified. Both frontend and backend Dockerfiles use `user 1001`.
- [ ] **Read-only Filesystems**: Set `readOnlyRootFilesystem: true` in the Helm deployment templates if possible (requires Next.js cache mounts).
- [ ] **Vulnerability Scanning**: CI/CD pipeline runs Trivy successfully.

## Reliability
- [ ] **Probes**: Liveness and Readiness probes are configured in the Helm chart. Ensure the `/health` endpoint effectively tests database and redis connections.
- [ ] **Pod Disruption Budgets**: Configured. Minimum 1 replica must always be available during cluster upgrades.
- [ ] **Rolling Updates**: Kubernetes defaults to `25%` max unavailable. This ensures zero-downtime deployments.
- [ ] **Autoscaling (HPA)**: Configured for Frontend, API, and Socket based on CPU utilization.
- [ ] **Resource Requests/Limits**: Memory and CPU limits are set to prevent noisy neighbors and Out-Of-Memory kills.

## Observability
- [ ] **Prometheus**: ServiceMonitors are configured. Ensure Prometheus Operator is running in the cluster.
- [ ] **Grafana**: Build custom dashboards tracing HPA scaling events, Socket.io connection counts, and API response times.
- [ ] **Logging (Loki/Promtail)**: Configured via `promtail.yaml`. Ensure log retention policies are set.
- [ ] **Tracing (OpenTelemetry)**: Basic `otel-collector.yaml` ConfigMap created. Instrumentation must be added to the Node.js code for full distributed tracing.

## State Management
- [ ] **Redis**: Ensure an external, highly available Redis instance is deployed (e.g., ElastiCache) for Socket.io adapter and BullMQ.
- [ ] **PostgreSQL**: Neon DB connection pool limits should be reviewed. Since we have multiple API/Worker pods, use PgBouncer or Neon's connection pooling to avoid max connection limits.
