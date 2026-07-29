# Apache Kafka Broker Configuration & Cluster Architecture

## KRaft Cluster Configuration
- **Kafka Version**: Official Apache Kafka 3.8.0
- **Deployment Mode**: KRaft (ZooKeeper-less)
- **Cluster ID**: `KCM-Kafka-KRaft-Prod-Cluster-UUID-001`
- **Nodes**: 3 StatefulSet replicas (`kcm-kafka-0`, `kcm-kafka-1`, `kcm-kafka-2`)
- **Process Roles**: `broker,controller`

## Network & Listener Matrix
| Listener Name | Port | Protocol | Purpose | Access Scope |
|---|---|---|---|---|
| `CLIENT` | 9092 | SASL_SSL | Application Producer/Consumer Traffic | Internal Cluster |
| `CONTROLLER` | 9093 | SASL_SSL | KRaft Metadata Quorum Replication | Broker-to-Broker |
| `INTERNAL` | 9094 | SASL_SSL | Inter-Broker Data Replication | Broker-to-Broker |
| `JMX` | 9308 | Plaintext | Prometheus JMX Exporter | Scraped by Prometheus |

## Storage Specs
- **Storage Provisioner**: Longhorn (`driver.longhorn.io`)
- **Storage Class**: `longhorn` / `longhorn-kafka`
- **Volume Size**: 100Gi per broker
- **Replication**: 3 Longhorn data replicas across nodes.
