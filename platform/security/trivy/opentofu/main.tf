# OpenTofu Module: Trivy Security Platform Provisioning

resource "kubernetes_namespace_v1" "trivy_system" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/name"             = "trivy-operator"
      "app.kubernetes.io/part-of"          = "kcm-security-platform"
      "pod-security.kubernetes.io/enforce" = "restricted"
      "pod-security.kubernetes.io/audit"   = "restricted"
      "pod-security.kubernetes.io/warn"    = "restricted"
    }
  }
}

resource "helm_release" "trivy_operator" {
  name       = "trivy-operator"
  repository = "https://aquasecurity.github.io/helm-charts"
  chart      = "trivy-operator"
  version    = var.chart_version
  namespace  = kubernetes_namespace_v1.trivy_system.metadata[0].name

  values = [
    yamlencode({
      trivy = {
        severity     = var.severity_levels
        ignoreUnfixed = false
        mode         = "Standalone"
      }
      operator = {
        replicas = var.replica_count
        scanners = "Vulnerability,ConfigAudit,Secret,RBAC"
      }
      serviceMonitor = {
        enabled = var.enable_monitoring
      }
    })
  ]
}
