resource "kubernetes_manifest" "longhorn_servicemonitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "longhorn-prometheus-servicemonitor"
      namespace = var.namespace
      labels = {
        release = "prometheus-stack"
      }
    }
    spec = {
      selector = {
        matchLabels = {
          app = "longhorn-manager"
        }
      }
      namespaceSelector = {
        matchNames = [var.namespace]
      }
      endpoints = [
        {
          port          = "manager"
          path          = "/metrics"
          interval      = "15s"
          scrapeTimeout = "10s"
        }
      ]
    }
  }

  depends_on = [helm_release.longhorn]
}
