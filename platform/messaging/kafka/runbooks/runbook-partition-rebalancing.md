# Operational Runbook: Kafka Partition Rebalancing

## Overview
How to trigger automated or manual rebalancing of topic partitions across brokers following scale-out or storage expansion.

## Execution Procedure
1. Generate reassignment JSON:
   ```bash
   kubectl exec -it -n messaging kcm-kafka-0 -- kafka-reassign-partitions.sh --bootstrap-server localhost:9092 --topics-to-move-json-file topics.json --broker-list "0,1,2" --generate
   ```
2. Execute partition reassignment:
   ```bash
   kubectl exec -it -n messaging kcm-kafka-0 -- kafka-reassign-partitions.sh --bootstrap-server localhost:9092 --reassignment-json-file migration.json --execute
   ```
3. Verify reassignment progress:
   ```bash
   kubectl exec -it -n messaging kcm-kafka-0 -- kafka-reassign-partitions.sh --bootstrap-server localhost:9092 --reassignment-json-file migration.json --verify
   ```
