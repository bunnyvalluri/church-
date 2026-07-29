resource "kubernetes_secret" "kafka_sasl_secret" {
  metadata {
    name      = "kcm-kafka-sasl-secret"
    namespace = kubernetes_namespace.kafka_namespace.metadata[0].name
  }

  type = "Opaque"

  data = {
    "admin-password"    = "ProductionKafkaAdminPasswordSecretKey512!"
    "producer-password" = "secret-producer-password"
    "consumer-password" = "secret-consumer-password"
  }
}
