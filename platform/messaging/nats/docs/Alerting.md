# Prometheus AlertManager Rules & Escalation Policies

## Overview
Alert rules are defined in `platform/messaging/nats/alerts/nats-alerts.yaml` and routed via AlertManager to PagerDuty and Slack channels.

## Alerting Threshold Matrix

| Alert Name | Trigger Expression | Severity | Notification Channel | Remediation SLA |
| :--- | :--- | :--- | :--- | :--- |
| `NATSNodeDown` | `count(gnatsd_varz_server_id) < 3` | Critical | PagerDuty + Slack `#alerts-infra` | 15 minutes |
| `NATSSlowConsumersDetected` | `sum(gnatsd_varz_slow_consumers) > 0` | Warning | Slack `#alerts-backend` | 1 hour |
| `NATSJetStreamStorageFull` | `storage > 80%` | Critical | PagerDuty + Slack `#alerts-infra` | 30 minutes |
| `NATSConsumerBacklogHigh` | `num_pending > 1000` | Warning | Slack `#alerts-backend` | 2 hours |
| `NATSConsumerOffline` | `ack_pending rate == 0 and pending > 50` | Critical | PagerDuty | 30 minutes |
