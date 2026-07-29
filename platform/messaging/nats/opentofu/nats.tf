resource "kubernetes_namespace" "messaging" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/managed-by" = "opentofu"
      "kcm-domain"                   = "messaging-platform"
    }
  }
}

resource "helm_release" "nats" {
  name       = "nats"
  repository = "https://nats-io.github.io/k8s/helm/charts/"
  chart      = "nats"
  version    = "1.2.9"
  namespace  = kubernetes_namespace.messaging.metadata[0].name

  values = [
    file("${path.module}/../helm/values.yaml")
  ]

  set {
    name  = "config.cluster.replicas"
    value = var.cluster_replicas
  }

  set {
    name  = "config.jetstream.fileStorage.pvc.storageClassName"
    value = var.storage_class
  }

  set {
    name  = "config.jetstream.fileStorage.pvc.size"
    value = var.storage_size
  }

  depends_on = [kubernetes_namespace.messaging]
}
