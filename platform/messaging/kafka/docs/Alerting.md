# Alerting Rules & Threshold Specifications

## Prometheus Alert Matrix (`prometheus-rules-kafka.yaml`)

| Alert Name | Severity | Condition | Description | Remediation Runbook |
|---|---|---|---|---|
| `KafkaBrokerDown` | Critical | Broker count < 3 | Broker offline or pod crash | `runbook-broker-failure.md` |
| `KafkaUnderReplicatedPartitions` | Critical | Replicas < 3 for >5m | Partition missing replica | `runbook-partition-rebalancing.md` |
| `KafkaOfflinePartitions` | Critical | Offline partitions > 0 | Partition unavailable | `runbook-broker-failure.md` |
| `KafkaHighConsumerLag` | Warning | Lag > 5000 for >5m | Worker processing delay | `runbook-consumer-lag-remediation.md` |
| `KafkaHighDiskUsage` | Warning | Usage > 85% | Storage space low | Longhorn volume expansion |
| `KafkaDLQMessagesDetected` | Warning | Messages in DLQ > 0 | Consumer processing error | Inspect DLQ payload & logs |
