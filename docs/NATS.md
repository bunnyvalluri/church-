# NATS JetStream Messaging & Key-Value Store

## Purpose
This document provides the technical specification for NATS JetStream, the high-performance, lightweight message broker and distributed key-value store powering microservice pub/sub and fast state caching for the Kingdom of Christ Ministries platform.

## Scope
Covers manifests in `platform/messaging/nats/`, JetStream stream definitions (`streams.yaml`), Key-Value stores (`kv-stores.yaml`), TypeScript publishers/subscribers, and operational runbooks.

## Status
> Status: Implemented

---

## 1. NATS JetStream Architecture

```mermaid
graph TD
    subgraph NATS JetStream Cluster (Namespace: kcm-system)
        NATSNode1[(NATS Node 1)]
        NATSNode2[(NATS Node 2)]
        NATSNode3[(NATS Node 3)]
    end

    subgraph JetStream Streams & Subjects
        StreamEvents[Stream: KCM_EVENTS (Subjects: kcm.events.>)]
        StreamNotif[Stream: KCM_NOTIFICATIONS (Subjects: kcm.notifications.>)]
        StreamDonation[Stream: KCM_DONATIONS (Subjects: kcm.donations.>)]
        KVStore[(NATS KV Store: app_runtime_config & session_cache)]
    end

    NATSNode1 --- StreamEvents
    NATSNode2 --- StreamNotif
    NATSNode3 --- StreamDonation
    NATSNode1 --- KVStore

    subgraph Publishers & Subscribers
        Publisher[publisher.ts] -->|Publish Event| StreamEvents
        StreamEvents --> Subscriber[subscriber.ts / worker.ts]
        StreamNotif --> Subscriber
    end
```

---

## 2. JetStream Stream & KV Configurations

### 2.1 Streams Definition (`platform/messaging/nats/jetstream/streams.yaml`)
- **`KCM_EVENTS`**: Retains domain events for 7 days with file storage backend and 3-way replication (`R: 3`).
- **`KCM_NOTIFICATIONS`**: Buffers outbound push, SMS, and email payloads with deduplication window of 2 minutes.

### 2.2 Distributed Key-Value Store (`kv-stores.yaml`)
- **`app_runtime_config`**: Distributes dynamic feature flags and banner alert toggles to all running pods in real-time.
- **`session_cache`**: Caches active user authentication tokens for sub-millisecond edge validation.

---

## 3. Publisher & Subscriber Implementation

- **Publisher (`platform/messaging/nats/publishers/publisher.ts`)**: Publishes messages with JetStream publish acknowledgements (`js.publish()`).
- **Durable Consumer (`platform/messaging/nats/subscribers/subscriber.ts`)**: Uses durable pull consumers to process batches of messages with explicit acknowledgements (`msg.ack()`).

---

## 4. Operational Runbooks (`platform/messaging/nats/runbooks/`)

- `cluster-recovery.md`: Restoring quorum after node network partitions.
- `consumer-lag-mitigation.md`: Scaling subscriber worker pools to clear backlogs.
- `dlq-drain-reprocess.md`: Reprocessing failed messages routed to the dead-letter subject.
- `storage-expansion.md`: Dynamically expanding NATS JetStream persistent volume disks.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `nats: no responders available for request` | No active subscriber listening on target subject | Verify that consumer worker pod is healthy and subscribed to the correct subject pattern. |
| `nats: jetstream not enabled` | NATS cluster started without `-js` flag | Verify `jetstream.enabled: true` in Helm values (`platform/messaging/nats/helm/values.yaml`). |

---

## Security Considerations
- NATS client connections authenticate using TLS certificates and bcrypt-hashed authentication tokens.
- User accounts enforce subject-level read/write permission whitelists.

## Related Documentation
- [Messaging.md](Messaging.md) — Asynchronous messaging overview.
- [Kafka.md](Kafka.md) — Apache Kafka streaming.
- [Helm.md](Helm.md) — NATS Helm packaging.
