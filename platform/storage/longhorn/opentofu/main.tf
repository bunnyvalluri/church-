# OpenTofu Main Module Entrypoint for Longhorn Enterprise Storage Platform

resource "kubernetes_namespace" "longhorn_system" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/name"      = "longhorn"
      "app.kubernetes.io/part-of"   = "kcm-platform"
      "pod-security.kubernetes.io/enforce" = "privileged"
    }
  }
}
