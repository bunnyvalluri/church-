# Alerting Documentation

## Overview
Prometheus alerting rules (`trivy-security-alerts`) evaluate Trivy Operator metrics every 30 seconds to provide immediate notification of security incidents.

---

## 1. Alert Rule Catalog

| Alert Rule Name | Condition | Evaluation Window | Target Team |
| :--- | :--- | :--- | :--- |
| **TrivyCriticalVulnerabilityDetected** | Critical CVE > 0 | 5m | DevSecOps |
| **TrivyHighVulnerabilityDetected** | High CVE > 0 | 15m | DevSecOps |
| **TrivyExposedSecretDetected** | Secret Count > 0 | 1m | Security Response |
| **TrivyOperatorScanFailed** | Scan Error > 0 | 10m | SRE |

---

## 2. Notification Channels
Alerts route via AlertManager to PagerDuty (Critical) and Slack `#security-alerts` (Warning/Info).
