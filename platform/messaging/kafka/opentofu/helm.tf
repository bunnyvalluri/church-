resource "helm_release" "kcm_kafka" {
  name       = "kcm-kafka"
  namespace  = kubernetes_namespace.kafka_namespace.metadata[0].name
  chart      = "../helm"
  dependency_update = true
  timeout    = 600

  set {
    name  = "replicaCount"
    value = var.broker_count
  }

  set {
    name  = "storage.size"
    value = var.storage_size
  }

  set {
    name  = "storage.storageClassName"
    value = var.storage_class_name
  }
}
