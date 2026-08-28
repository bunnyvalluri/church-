# Apache Kafka Event Streaming Architecture

## Purpose
This document provides the technical specification for Apache Kafka (deployed via the Strimzi Kubernetes Operator), managing high-throughput event streaming, distributed topics, producer/consumer services, and dead-letter queues across the Kingdom of Christ Ministries platform.

## Scope
Covers manifests in `platform/messaging/kafka/`, Helm charts, OpenTofu modules, typed TypeScript producers/consumers, and operational runbooks.

## Status
> Status: Implemented

---

## 1. Kafka Cluster Architecture

```mermaid
graph TD
    subgraph Strimzi Kafka Cluster (Namespace: kcm-system)
        Broker1[(Kafka Broker 1)]
        Broker2[(Kafka Broker 2)]
        Broker3[(Kafka Broker 3)]
    end

    subgraph Kafka Topics
        TopicAuth[kcm.auth.events (Partitions: 3, Replicas: 3)]
        TopicEvents[kcm.church.events (Partitions: 3, Replicas: 3)]
        TopicDonations[kcm.donation.events (Partitions: 3, Replicas: 3)]
        TopicMedia[kcm.media.events (Partitions: 3, Replicas: 3)]
        TopicAudit[kcm.audit.events (Partitions: 3, Replicas: 3)]
        TopicDLQ[kcm.dead-letter.events (Partitions: 3, Replicas: 3)]
    end

    Broker1 --- TopicAuth
    Broker2 --- TopicEvents
    Broker3 --- TopicDonations
    Broker1 --- TopicMedia
    Broker2 --- TopicAudit
    Broker3 --- TopicDLQ

    subgraph Producers
        AuthProd[auth-producer.ts] --> TopicAuth
        EventProd[church-event-producer.ts] --> TopicEvents
        DonationProd[donation-producer.ts] --> TopicDonations
        MediaProd[media-producer.ts] --> TopicMedia
        AuditProd[audit-producer.ts] --> TopicAudit
    end

    subgraph Consumers
        TopicEvents --> NotifCons[notification-consumer.ts]
        TopicMedia --> SearchCons[search-consumer.ts]
        TopicDLQ --> DLQHandler[dlq-handler.ts]
    end
```

---

## 2. Topic Inventory (`platform/messaging/kafka/topics/kafka-topics-config.yaml`)

| Topic Name | Partitions | Replication Factor | Retention (Hours) | Compaction Policy |
| :--- | :---: | :---: | :---: | :--- |
| `kcm.auth.events` | `3` | `3` | `168` (7 Days) | `delete` |
| `kcm.church.events`| `3` | `3` | `720` (30 Days)| `delete` |
| `kcm.donation.events`| `3`| `3` | `2160` (90 Days)| `compact,delete` |
| `kcm.media.events` | `3` | `3` | `168` (7 Days) | `delete` |
| `kcm.audit.events` | `3` | `3` | `8760` (1 Year)| `compact,delete` |
| `kcm.dead-letter.events`| `3`| `3` | `720` (30 Days)| `delete` |

---

## 3. Producer & Consumer Implementations

### 3.1 Producer Service (`platform/messaging/kafka/producers/kafka-producer.service.ts`)
- Configured with `acks: "all"` (`-1`) to ensure writes are committed across all in-sync replicas before returning success.
- Implements idempotent producer mode (`enable.idempotence: true`) to prevent message duplication during network retries.

### 3.2 Consumer Service (`platform/messaging/kafka/consumers/kafka-consumer.service.ts`)
- Consumer groups scale dynamically across available topic partitions.
- Manually commits offsets only after downstream business processing completes successfully (`enable.auto.commit: false`).

---

## 4. Operational Runbooks (`platform/messaging/kafka/runbooks/`)

- `runbook-broker-failure.md`: Diagnosing and replacing a crashed Kafka broker pod.
- `runbook-consumer-lag-remediation.md`: Scaling consumer replicas to drain backlog spikes.
- `runbook-partition-rebalancing.md`: Rebalancing topic partition assignments across nodes.
- `runbook-disaster-recovery.md`: Restoring Kafka cluster metadata from Longhorn snapshots.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `NotEnoughReplicasException` | Less than `min.insync.replicas` (2) brokers available | Check broker pod status via `kubectl get pods -n kcm-system -l app.kubernetes.io/name=kafka`. |
| Consumer lag continuously increasing | Consumer process crashing on poison pill message | Inspect DLQ handler logs and route unparseable messages to `kcm.dead-letter.events`. |

---

## Security Considerations
- Communication between brokers and client pods enforces TLS encryption with mutual certificate verification (mTLS).
- Kafka ACLs (`kafka-acls.yaml`) restrict producer write access strictly to authorized topics.

## Related Documentation
- [Messaging.md](Messaging.md) — Event-driven overview.
- [NATS.md](NATS.md) — NATS JetStream messaging.
- [Monitoring.md](Monitoring.md) — Kafka consumer lag dashboards.
