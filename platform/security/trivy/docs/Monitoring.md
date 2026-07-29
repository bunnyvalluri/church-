# Monitoring & Metrics Documentation

## Overview
Trivy Operator metrics are continuously collected by Prometheus via a custom ServiceMonitor (`trivy-operator-metrics`) in `trivy-system`.

---

## 1. Key Prometheus Metrics Exposed

| Metric Name | Type | Description |
| :--- | :--- | :--- |
| `trivy_vulnerability_reports` | Gauge | Count of detected vulnerabilities by severity and workload |
| `trivy_config_audit_reports` | Gauge | Count of passed/failed IaC configuration audit checks |
| `trivy_exposed_secret_reports` | Gauge | Count of exposed secrets detected in cluster resources |
| `trivy_operator_scan_errors_total` | Counter | Total scan job failures encountered by Trivy Operator |

---

## 2. Grafana Dashboard Overview
The dashboard `trivy-overview-dashboard` visualizes:
- Total Critical/High Vulnerabilities across namespaces
- Exposed Secret alerts
- CIS Benchmark compliance status
- Vulnerability trends over time
