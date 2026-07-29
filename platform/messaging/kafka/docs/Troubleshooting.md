# Troubleshooting & Diagnostic Manual

## Diagnostic Commands Quick Reference

### Check KRaft Cluster Metadata Quorum
```bash
kubectl exec -it -n messaging kcm-kafka-0 -- kafka-metadata-shell.sh --snapshot /bitnami/kafka/data/__cluster_metadata-0/00000000000000000000.log ls /
```

### Inspect Topic Details & ISR Replicas
```bash
kubectl exec -it -n messaging kcm-kafka-0 -- kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic donation.events
```

### Inspect Consumer Group Lag
```bash
kubectl exec -it -n messaging kcm-kafka-0 -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --all-groups
```

### Test Producer Message Publishing
```bash
kubectl exec -it -n messaging kcm-kafka-0 -- kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test.events
```
