resource "helm_release" "kcm_kafka" {
  name       = "kcm-kafka"
  namespace  = kubernetes_namespace.kafka_namespace.metadata[0].name
  chart      = "../helm"
  dependency_update = true
  timeout    = 600

  values = [
    yamlencode({
      replicaCount = var.broker_count
      storage = {
        size             = var.storage_size
        storageClassName = var.storage_class_name
      }
    })
  ]
}
