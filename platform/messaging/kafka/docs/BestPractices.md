# Kafka Development & Operational Best Practices

## Producer Best Practices
1. **Always Set Idempotence**: Enable `idempotent: true` and `acks: all` to prevent message duplication or reordering during broker leadership failover.
2. **Key Every Message**: Always assign a domain entity key to ensure ordering per entity across partitions.
3. **Propagate Context**: Include OpenTelemetry `traceparent` headers for full distributed tracing visibility.

## Consumer Best Practices
1. **Manual Commit**: Commit offsets manually only *after* successful message handling or DLQ dispatch.
2. **Graceful Shutdown**: Intercept `SIGTERM` / `SIGINT` signals to close consumer connections and complete batch processing cleanly.
3. **Dead Letter Queue Routing**: Catch processing exceptions and publish failed records to `<topic>.DLQ` to avoid halting consumer group progress.

## Operational Best Practices
1. **Replication Factor**: Maintain RF=3 and `min.insync.replicas=2` for all production topics.
2. **Storage Management**: Use Longhorn PVCs with high throughput and data locality settings.
3. **Automate Drift via GitOps**: Apply all topic, secret, and monitoring changes exclusively via Git and Argo CD.
