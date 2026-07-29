resource "helm_release" "longhorn" {
  name       = "longhorn"
  repository = "https://charts.longhorn.io"
  chart      = "longhorn"
  version    = var.longhorn_chart_version
  namespace  = kubernetes_namespace.longhorn_system.metadata[0].name

  values = [
    file("${path.module}/../helm/values.yaml")
  ]

  depends_on = [
    kubernetes_namespace.longhorn_system
  ]
}
