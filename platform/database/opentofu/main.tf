terraform {
  required_version = ">= 1.6.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.0"
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

resource "kubernetes_namespace" "kcm_database" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/name"             = "kcm-postgresql"
      "app.kubernetes.io/part-of"          = "kcm-database-platform"
      "pod-security.kubernetes.io/enforce" = "restricted"
    }
  }
}
