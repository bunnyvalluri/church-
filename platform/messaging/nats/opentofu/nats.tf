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
    file("${path.module}/../helm/values.yaml"),
    yamlencode({
      config = {
        cluster = {
          replicas = var.cluster_replicas
        }
        jetstream = {
          fileStorage = {
            pvc = {
              storageClassName = var.storage_class
              size             = var.storage_size
            }
          }
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace.messaging]
}
