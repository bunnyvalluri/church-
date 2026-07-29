# Enterprise Event Streaming Platform - Architecture

## Executive Overview
The Kingdom of Christ Ministries (KCM Church) Enterprise Event Streaming Platform is designed on **official Apache Kafka** running in **KRaft mode (Kafka Raft Metadata)**. This architecture eliminates external ZooKeeper dependencies, simplifying cluster metadata state management while delivering low latency, high throughput, zero data loss, and seamless scalability for church applications, donation processing, notifications, and analytics streams.

## System Topology & Architecture

```
[ Frontend: Next.js / React ]
              │
              ▼ (HTTPS / REST / GraphQL)
[ Backend Microservices (Node.js / Express) ] ── (SASL_SSL / mTLS) ──┐
              │                                                     │
              ▼                                                     ▼
     ┌─────────────────────────────────────────────────────────────────┐
     │                KCM Kafka KRaft Cluster (3 Brokers)              │
     │ ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
     │ │ kcm-kafka-0    │  │ kcm-kafka-1    │  │ kcm-kafka-2    │ │
     │ │ (Broker+Ctrlr) │  │ (Broker+Ctrlr) │  │ (Broker+Ctrlr) │ │
     │ └───────┬────────┘  └───────┬────────┘  └───────┬────────┘ │
     └─────────┼───────────────────┼───────────────────┼──────────┘
               │                   │                   │
               ▼                   ▼                   ▼
    ┌───────────────────────────────────────────────────────────┐
    │     Longhorn Distributed Storage Engine (SC: longhorn)   │
    └───────────────────────────────────────────────────────────┘
               │
               ├────────────────────────┬────────────────────────┐
               ▼                        ▼                        ▼
    ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
    │ Notification Workers │ │ Audit Index Workers  │ │  Analytics Stream    │
    │ (Email / SMS / Push) │ │ (CloudNativePG DB)   │ │  (Real-Time Engine)  │
    └──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

## Key Architectural Principles
1. **KRaft Consensus Quorum**: Metadata is managed natively by 3 Kafka brokers operating in combined Broker + Controller roles using the Raft consensus protocol.
2. **Replication Factor & Min Insync Replicas**: All production topics maintain a Replication Factor of 3 and `min.insync.replicas=2` for strict fault-tolerance.
3. **At-Least-Once Delivery with Idempotent Processing**: Producers enforce `enable.idempotence=true` and `acks=all`. Consumers track processing offset state and deduplicate using Redis.
4. **CloudEvents v1.0 Standard**: Standardized event format across all 13 production topics.
5. **End-to-End Tracing**: OpenTelemetry trace context propagated via Kafka message headers into Jaeger.
