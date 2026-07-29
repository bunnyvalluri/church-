# Kafka Consumer Architecture & Worker Patterns

## Enterprise Consumer Design Pattern
Background workers process event streams using `KcmKafkaConsumerService` (`platform/messaging/kafka/consumers/kafka-consumer.service.ts`).

### Resilience Mechanics
1. **Manual Offset Commit**: Offsets are committed only after successful business processing.
2. **Dead Letter Queue (DLQ)**: Poisoned messages that fail processing are routed to `<topic>.DLQ` via `DlqHandler`.
3. **Trace Context Extraction**: Reads `traceparent` headers to link Jaeger spans from Producer -> Broker -> Consumer worker.
4. **Idempotent Storage Check**: Key deduping check against Redis before executing state mutations.
