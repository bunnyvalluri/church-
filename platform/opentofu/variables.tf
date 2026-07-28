variable "kubeconfig_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Path to the kubeconfig file."
}

variable "namespace" {
  type        = string
  default     = "argo-rollouts"
  description = "Target namespace for Argo Rollouts controller."
}

variable "argo_rollouts_version" {
  type        = string
  default     = "2.35.0" # Helm chart version corresponding to v1.7.2
  description = "Argo Rollouts Helm chart version."
}
---
# rollouts.tf
resource "kubernetes_namespace" "argo_rollouts" {
  metadata {
    name = var.namespace
    labels = {
      "pod-security.kubernetes.io/enforce" = "restricted"
      "app.kubernetes.io/part-of"           = "argo-rollouts"
    }
  }
}

resource "helm_release" "argo_rollouts" {
  name       = "argo-rollouts"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-rollouts"
  version    = var.argo_rollouts_version
  namespace  = kubernetes_namespace.argo_rollouts.metadata[0].name

  set {
    name  = "controller.replicas"
    value = "2"
  }

  set {
    name  = "dashboard.enabled"
    value = "true"
  }

  set {
    name  = "notifications.secret.create"
    value = "true"
  }
}
---
# outputs.tf
output "argo_rollouts_namespace" {
  value       = kubernetes_namespace.argo_rollouts.metadata[0].name
  description = "Namespace where Argo Rollouts controller is deployed."
}

output "helm_release_status" {
  value       = helm_release.argo_rollouts.status
  description = "Status of Argo Rollouts Helm release."
}
