# =============================================================================
# Falco Monitoring OpenTofu Module — Main
# Kingdom of Christ Ministries — Enterprise Runtime Security Platform
# =============================================================================
# Provisions Grafana dashboard ConfigMaps, ServiceMonitor, PrometheusRule.
# =============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.26.0"
    }
  }
}

locals {
  monitoring_namespace = var.monitoring_namespace
  dashboard_path       = "${path.module}/../../../platform/security/falco/dashboards"
  rules_path           = "${path.module}/../../../platform/security/falco/alerts"

  common_labels = merge({
    "app.kubernetes.io/name"      = "falco"
    "app.kubernetes.io/component" = "monitoring"
    "app.kubernetes.io/part-of"   = "kcm-security-platform"
    "app.kubernetes.io/managed-by" = "opentofu"
  }, var.additional_labels)
}

# ---------------------------------------------------------------------------
# Grafana Dashboard ConfigMaps
# One ConfigMap per dashboard — Grafana sidecar auto-discovers with label
# ---------------------------------------------------------------------------
resource "kubernetes_config_map" "grafana_dashboard_security_overview" {
  metadata {
    name      = "grafana-dashboard-falco-security-overview"
    namespace = local.monitoring_namespace
    labels    = merge(local.common_labels, {
      "grafana_dashboard" = "1"
    })
    annotations = {
      "grafana_folder" = "Security"
    }
  }

  data = {
    "falco-security-overview.json" = file("${local.dashboard_path}/falco-security-overview.json")
  }
}

resource "kubernetes_config_map" "grafana_dashboard_falco_events" {
  metadata {
    name      = "grafana-dashboard-falco-events"
    namespace = local.monitoring_namespace
    labels    = merge(local.common_labels, {
      "grafana_dashboard" = "1"
    })
    annotations = {
      "grafana_folder" = "Security"
    }
  }

  data = {
    "falco-events.json" = file("${local.dashboard_path}/falco-events.json")
  }
}

resource "kubernetes_config_map" "grafana_dashboard_container_threats" {
  metadata {
    name      = "grafana-dashboard-falco-container-threats"
    namespace = local.monitoring_namespace
    labels    = merge(local.common_labels, {
      "grafana_dashboard" = "1"
    })
    annotations = {
      "grafana_folder" = "Security"
    }
  }

  data = {
    "falco-container-threats.json" = file("${local.dashboard_path}/falco-container-threats.json")
  }
}

resource "kubernetes_config_map" "grafana_dashboard_pod_security" {
  metadata {
    name      = "grafana-dashboard-falco-pod-security"
    namespace = local.monitoring_namespace
    labels    = merge(local.common_labels, {
      "grafana_dashboard" = "1"
    })
    annotations = {
      "grafana_folder" = "Security"
    }
  }

  data = {
    "falco-pod-security.json" = file("${local.dashboard_path}/falco-pod-security.json")
  }
}

resource "kubernetes_config_map" "grafana_dashboard_threat_timeline" {
  metadata {
    name      = "grafana-dashboard-falco-threat-timeline"
    namespace = local.monitoring_namespace
    labels    = merge(local.common_labels, {
      "grafana_dashboard" = "1"
    })
    annotations = {
      "grafana_folder" = "Security"
    }
  }

  data = {
    "falco-threat-timeline.json" = file("${local.dashboard_path}/falco-threat-timeline.json")
  }
}

# ---------------------------------------------------------------------------
# ServiceMonitor — Prometheus discovers Falcosidekick metrics
# ---------------------------------------------------------------------------
resource "kubernetes_manifest" "falcosidekick_servicemonitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "falcosidekick"
      namespace = local.monitoring_namespace
      labels    = merge(local.common_labels, {
        release = "kube-prometheus-stack"
      })
    }
    spec = {
      namespaceSelector = {
        matchNames = ["falco"]
      }
      selector = {
        matchLabels = {
          "app.kubernetes.io/name" = "falcosidekick"
        }
      }
      endpoints = [{
        port     = "http"
        path     = "/metrics"
        interval = "30s"
        scrapeTimeout = "10s"
        relabelings = [{
          sourceLabels = ["__address__"]
          action       = "replace"
          targetLabel  = "instance"
          regex        = "(.+):.*"
          replacement  = "$1"
        }]
      }]
    }
  }
}
