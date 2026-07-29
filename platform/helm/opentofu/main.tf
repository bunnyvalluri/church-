# OpenTofu Infrastructure Provisioning for Helm OCI Registry & Repositories
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "kubernetes_namespace" "helm_namespaces" {
  for_each = toset([
    "kcm-production",
    "kcm-staging",
    "kcm-development",
    "kcm-database",
    "kcm-messaging",
    "kcm-observability",
    "kcm-security"
  ])

  metadata {
    name = each.key
    labels = {
      "app.kubernetes.io/managed-by" = "opentofu"
      "istio-injection"              = "enabled"
    }
  }
}

resource "kubernetes_secret" "ghcr_oci_credentials" {
  for_each = kubernetes_namespace.helm_namespaces

  metadata {
    name      = "ghcr-oci-credentials"
    namespace = each.key
  }

  type = "kubernetes.io/dockerconfigjson"

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "ghcr.io" = {
          username = var.ghcr_username
          password = var.ghcr_pat
          auth     = base64encode("${var.ghcr_username}:${var.ghcr_pat}")
        }
      }
    })
  }
}

resource "helm_release" "argocd_root" {
  name             = "argocd-root"
  chart            = "../charts/argocd"
  namespace        = "argocd"
  create_namespace = true
  values           = [file("../charts/argocd/values-production.yaml")]

  depends_on = [kubernetes_namespace.helm_namespaces]
}
