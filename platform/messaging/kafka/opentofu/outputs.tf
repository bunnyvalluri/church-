output "kafka_bootstrap_service" {
  value       = "kcm-kafka.messaging.svc.cluster.local:9092"
  description = "Kafka cluster bootstrap service address"
}

output "kafka_namespace" {
  value       = kubernetes_namespace.kafka_namespace.metadata[0].name
  description = "Kafka Kubernetes namespace"
}
