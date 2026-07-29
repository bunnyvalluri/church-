# Grafana Integration & Automated Dashboards

## Data Source Setup
Grafana automatically connects to Loki via HTTP API endpoint:
`http://loki-gateway.logging.svc.cluster.local:3100`

### Provisioned Dashboards
1. **Cluster Logs Dashboard** (`kcm-cluster-logs`): Namespace log rates, container error totals, cluster log viewer.
2. **Application Logs Dashboard** (`kcm-application-logs`): Node.js / Express / Next.js HTTP 5xx errors, Winston JSON fields, trace correlation.
3. **Security Logs & Falco Audit** (`kcm-security-logs`): Falco rule triggers, Firebase authentication failure spikes, privilege escalation audit.
4. **Database Logs** (`kcm-database-logs`): CloudNativePG PostgreSQL slow query execution (>200ms), PgBouncer, backup/restore events.
5. **Gateway Logs** (`kcm-gateway-logs`): Envoy Gateway API HTTP access codes, response latency distribution, TLS handshake errors.
6. **Deployment Logs** (`kcm-deployment-logs`): Argo CD & Argo Rollouts deployment events and Kubernetes warning events.
