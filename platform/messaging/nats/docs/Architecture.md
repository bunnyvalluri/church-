# Enterprise NATS & JetStream Messaging Platform Architecture

## Executive Summary
This document defines the enterprise event-driven messaging architecture for **Kingdom of Christ Ministries (KCM Church)** using the official `nats-server` project (`nats-io/nats-server`).

The NATS Messaging Backbone handles high-throughput asynchronous communication across KCM microservices, background job execution, real-time push/SMS notifications, video transcode processing, and audit logging.

## Core Architectural Components

```
                     +-----------------------------------+
                     |      Next.js Frontend / Clients   |
                     +-----------------+-----------------+
                                       | HTTP / WS
                                       v
                     +-----------------+-----------------+
                     |   Express.js Node.js API Gateways |
                     +-----------------+-----------------+
                                       | NATS Client Protocol
                                       | TLS 1.3 / NKEY Auth
                                       v
         +---------------------------------------------------------------+
         |                  NATS 3-Node HA StatefulSet                   |
         |            (nats-0, nats-1, nats-2 - RAFT Cluster)            |
         |                                                               |
         |  +---------------------+  +--------------------------------+  |
         |  |   Core Pub/Sub      |  |     JetStream Engine           |  |
         |  |  Subject Router     |  | (R3 File Storage on Longhorn) |  |
         |  +---------------------+  +--------------------------------+  |
         +---------------------------------------------------------------+
                                       |
         +-----------------------------+---------------------------------+
         |                             |                                 |
         v                             v                                 v
+------------------+         +-------------------+             +-------------------+
| Email / SMS      |         | Media Processing  |             | Audit & Security  |
| Worker Group     |         | Transcoder Group  |             | Indexer Group     |
+------------------+         +-------------------+             +-------------------+
```

## High Availability & Resilience Design
1. **3-Node RAFT Consensus Cluster**: Ensures zero message loss and automatic leader election upon node failover.
2. **Longhorn Persistent Block Storage**: Streams are backed by encrypted NVMe persistent volumes (`longhorn-crypto-nvme`) with 3-way storage replication.
3. **Queue Groups & WorkQueues**: Ensures load-balanced message processing across scalable worker pod replicas.
4. **Dead Letter Queue (DLQ)**: Retries failed messages with exponential backoff before sending unprocessable messages to `audit.logs.dlq.*`.

## Security Architecture
- TLS 1.3 encrypted transport with cert-manager automated certificate lifecycle.
- NKEY and JWT-based account isolation (`KCM_APP`, `KCM_ADMIN`).
- Strict subject ACL permissions adhering to the principle of least privilege.
