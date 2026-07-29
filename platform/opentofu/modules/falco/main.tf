# =============================================================================
# Falco OpenTofu Module — Main
# Kingdom of Christ Ministries — Enterprise Runtime Security Platform
# =============================================================================
# Provisions:
# - falco namespace
# - RBAC (ClusterRole + ClusterRoleBinding)
# - ServiceAccount
# - NetworkPolicy
# - Falco Helm release (official falcosecurity chart)
# - Falcosidekick Helm release
# =============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.26.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.0"
    }
  }
}

# ---------------------------------------------------------------------------
# Namespace
# ---------------------------------------------------------------------------
resource "kubernetes_namespace" "falco" {
  metadata {
    name = var.falco_namespace

    labels = merge(var.tags, {
      "app.kubernetes.io/name"                     = "falco"
      "app.kubernetes.io/part-of"                  = "kcm-security-platform"
      "app.kubernetes.io/managed-by"               = "opentofu"
      "security.kcm.church/component"              = "runtime-security"
      "cluster"                                    = var.cluster_name
      "environment"                                = var.environment
      "pod-security.kubernetes.io/enforce"         = "privileged"
      "pod-security.kubernetes.io/enforce-version" = "latest"
      "pod-security.kubernetes.io/audit"           = "privileged"
      "pod-security.kubernetes.io/warn"            = "privileged"
    })

    annotations = {
      "security.kcm.church/description" = "Falco runtime security engine namespace"
      "meta.helm.sh/release-name"       = "falco"
      "meta.helm.sh/release-namespace"  = var.falco_namespace
    }
  }
}

# ---------------------------------------------------------------------------
# ServiceAccount
# ---------------------------------------------------------------------------
resource "kubernetes_service_account" "falco" {
  metadata {
    name      = "falco"
    namespace = kubernetes_namespace.falco.metadata[0].name

    labels = {
      "app.kubernetes.io/name"      = "falco"
      "app.kubernetes.io/managed-by" = "opentofu"
    }
  }

  automount_service_account_token = true
}

# ---------------------------------------------------------------------------
# ClusterRole — read-only
# ---------------------------------------------------------------------------
resource "kubernetes_cluster_role" "falco" {
  metadata {
    name = "falco"
    labels = {
      "app.kubernetes.io/name"      = "falco"
      "app.kubernetes.io/managed-by" = "opentofu"
    }
  }

  rule {
    api_groups = [""]
    resources  = ["pods", "pods/status", "nodes", "nodes/status", "namespaces",
                   "events", "serviceaccounts", "resourcequotas", "limitranges"]
    verbs      = ["get", "list", "watch"]
  }

  rule {
    api_groups = ["apps"]
    resources  = ["replicasets", "daemonsets", "deployments", "statefulsets"]
    verbs      = ["get", "list", "watch"]
  }

  rule {
    api_groups = ["batch"]
    resources  = ["jobs", "cronjobs"]
    verbs      = ["get", "list", "watch"]
  }

  rule {
    non_resource_urls = ["/metrics"]
    verbs             = ["get"]
  }
}

# ---------------------------------------------------------------------------
# ClusterRoleBinding
# ---------------------------------------------------------------------------
resource "kubernetes_cluster_role_binding" "falco" {
  metadata {
    name = "falco"
    labels = {
      "app.kubernetes.io/name"      = "falco"
      "app.kubernetes.io/managed-by" = "opentofu"
    }
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.falco.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.falco.metadata[0].name
    namespace = kubernetes_namespace.falco.metadata[0].name
  }
}

# ---------------------------------------------------------------------------
# Helm: Falco (official chart)
# ---------------------------------------------------------------------------
resource "helm_release" "falco" {
  name             = "falco"
  repository       = "https://falcosecurity.github.io/charts"
  chart            = "falco"
  version          = var.falco_chart_version
  namespace        = kubernetes_namespace.falco.metadata[0].name
  create_namespace = false
  atomic           = true
  cleanup_on_fail  = true
  wait             = true
  wait_for_jobs    = true
  timeout          = 600

  # Merge base values + HA values
  values = [
    file("${path.module}/../../../security/falco/helm/values.yaml"),
    file("${path.module}/../../../security/falco/helm/values-ha.yaml"),
  ]

  set {
    name  = "driver.kind"
    value = var.falco_driver_kind
  }

  set {
    name  = "falco.grpc.enabled"
    value = "true"
  }

  set {
    name  = "falco.http_output.url"
    value = "http://falcosidekick.${kubernetes_namespace.falco.metadata[0].name}.svc.cluster.local:2801/"
  }

  set {
    name  = "resources.requests.cpu"
    value = var.falco_resources_cpu_request
  }

  set {
    name  = "resources.requests.memory"
    value = var.falco_resources_memory_request
  }

  set {
    name  = "resources.limits.cpu"
    value = var.falco_resources_cpu_limit
  }

  set {
    name  = "resources.limits.memory"
    value = var.falco_resources_memory_limit
  }

  depends_on = [
    kubernetes_cluster_role_binding.falco,
    kubernetes_service_account.falco,
  ]
}

# ---------------------------------------------------------------------------
# Helm: Falcosidekick (official chart)
# ---------------------------------------------------------------------------
resource "helm_release" "falcosidekick" {
  name             = "falcosidekick"
  repository       = "https://falcosecurity.github.io/charts"
  chart            = "falcosidekick"
  version          = var.falcosidekick_chart_version
  namespace        = kubernetes_namespace.falco.metadata[0].name
  create_namespace = false
  atomic           = true
  cleanup_on_fail  = true
  wait             = true
  timeout          = 300

  values = [
    file("${path.module}/../../../security/falco/helm/values-falcosidekick.yaml"),
  ]

  set {
    name  = "config.loki.hostport"
    value = var.loki_endpoint
  }

  set {
    name  = "config.alertmanager.hostport"
    value = var.alertmanager_endpoint
  }

  set {
    name  = "config.otlp.traces.endpoint"
    value = var.otel_endpoint
  }

  set {
    name  = "replicaCount"
    value = var.enable_high_availability ? 2 : 1
  }

  depends_on = [
    helm_release.falco,
  ]
}

# ---------------------------------------------------------------------------
# NetworkPolicy
# ---------------------------------------------------------------------------
resource "kubernetes_network_policy" "falco" {
  metadata {
    name      = "falco-network-policy"
    namespace = kubernetes_namespace.falco.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "falco"
      "app.kubernetes.io/managed-by" = "opentofu"
    }
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/name" = "falco"
      }
    }

    policy_types = ["Ingress", "Egress"]

    ingress {
      from {
        namespace_selector {
          match_labels = {
            "kubernetes.io/metadata.name" = "monitoring"
          }
        }
      }
      ports {
        protocol = "TCP"
        port     = "2801"
      }
    }

    egress {
      to {
        namespace_selector {
          match_labels = {
            "kubernetes.io/metadata.name" = "monitoring"
          }
        }
      }
      ports {
        protocol = "TCP"
        port     = "3100"
      }
      ports {
        protocol = "TCP"
        port     = "9093"
      }
    }

    egress {
      ports {
        protocol = "TCP"
        port     = "6443"
      }
      ports {
        protocol = "UDP"
        port     = "53"
      }
    }
  }
}
