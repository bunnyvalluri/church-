# ==============================================================================
# Kingdom of Christ Ministries — OpenTofu Gateway Module (Phase 13)
# ==============================================================================
# Deploys Envoy Gateway v1.8.3 via Helm using the official OCI chart.
# ==============================================================================

terraform {
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.26.0"
    }
    kubectl = {
      source  = "alekc/kubectl"
      version = "~> 2.0.0"
    }
  }
}

# ── Gateway Namespace ─────────────────────────────────────────────────────────
resource "kubernetes_namespace" "envoy_gateway_system" {
  metadata {
    name = var.gateway_namespace
    labels = {
      "app.kubernetes.io/name"                     = var.gateway_namespace
      "app.kubernetes.io/component"                = "gateway"
      "app.kubernetes.io/part-of"                  = "kcm-church-portal"
      "environment"                                = "production"
      "pod-security.kubernetes.io/enforce"         = "restricted"
      "pod-security.kubernetes.io/enforce-version" = "v1.29"
      "pod-security.kubernetes.io/audit"           = "restricted"
    }
  }
}

# ── Envoy Gateway Helm Release ────────────────────────────────────────────────
resource "helm_release" "envoy_gateway" {
  name             = "envoy-gateway"
  repository       = "oci://docker.io/envoyproxy"
  chart            = "gateway-helm"
  version          = var.envoy_gateway_version
  namespace        = kubernetes_namespace.envoy_gateway_system.metadata[0].name
  create_namespace = false
  wait             = true
  wait_for_jobs    = true
  timeout          = 600 # 10 minutes

  values = [
    yamlencode({
      config = {
        envoyGateway = {
          apiVersion = "gateway.envoyproxy.io/v1alpha1"
          kind       = "EnvoyGateway"
          gateway = {
            controllerName = "gateway.envoyproxy.io/gatewayclass-controller"
          }
          provider = {
            type = "Kubernetes"
          }
          logging = {
            level = { default = "info" }
          }
          telemetry = {
            metrics = { prometheus = { disable = false } }
          }
        }
      }
      deployment = {
        replicas = var.gateway_replicas
        container = {
          resources = {
            requests = { cpu = "100m", memory = "256Mi" }
            limits   = { cpu = "500m", memory = "1Gi" }
          }
        }
      }
      podDisruptionBudget = {
        enabled      = true
        minAvailable = 1
      }
    })
  ]

  depends_on = [kubernetes_namespace.envoy_gateway_system]
}

# ── GatewayClass ──────────────────────────────────────────────────────────────
resource "kubectl_manifest" "gatewayclass" {
  yaml_body = <<-YAML
    apiVersion: gateway.networking.k8s.io/v1
    kind: GatewayClass
    metadata:
      name: kcm-gateway-class
      labels:
        app.kubernetes.io/managed-by: opentofu
    spec:
      controllerName: gateway.envoyproxy.io/gatewayclass-controller
      description: "KCM Church Enterprise Gateway Class — Envoy Gateway ${var.envoy_gateway_version}"
  YAML

  depends_on = [helm_release.envoy_gateway]
}

# ── Wait for Gateway LB IP ────────────────────────────────────────────────────
data "kubernetes_service" "gateway_lb" {
  metadata {
    name      = "envoy-kcm-system-kcm-gateway-https"
    namespace = "kcm-system"
  }
  depends_on = [helm_release.envoy_gateway]
}
