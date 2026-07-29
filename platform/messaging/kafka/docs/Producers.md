# Kafka Producer Architecture & Patterns

## Enterprise Producer Design Pattern
All Node.js microservices publish events through `KcmKafkaProducerService` (`platform/messaging/kafka/producers/kafka-producer.service.ts`).

### Key Capabilities
- **Idempotence**: Guaranteed single write delivery (`idempotent: true`, `acks: -1`, `maxInFlightRequests: 1`).
- **CloudEvents v1.0 Packaging**: Event body is wrapped with metadata, timestamp, event ID, source, and version.
- **OpenTelemetry Context Propagation**: Injects `traceparent` headers into message metadata.
- **Compression**: `ZSTD` for high-ratio data compression.
