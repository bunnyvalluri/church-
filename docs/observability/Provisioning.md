# Automated Grafana Provisioning Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## Declarative Provisioning Framework

Grafana is provisioned statelessly on container start using file-based provisioning declarations:

1. **Datasources**: Declarative YAML configs in `monitoring/datasources/` (Prometheus, Loki, Postgres, Redis, Alertmanager).
2. **Dashboards**: JSON models in `monitoring/dashboards/` synced automatically via Grafana sidecar operator.
3. **Contact Points & Alert Policies**: Configured via `monitoring/contact-points/` and `monitoring/notification-policies/`.
4. **Infrastructure as Code**: Managed via OpenTofu modules in `monitoring/terraform-or-opentofu/`.
