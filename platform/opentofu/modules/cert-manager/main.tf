# ==============================================================================
# Kingdom of Christ Ministries — cert-manager OpenTofu Module (Phase 13)
# ==============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.0"
    }
    kubectl = {
      source  = "alekc/kubectl"
      version = "~> 2.0.0"
    }
  }
}

resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  version          = var.cert_manager_version
  namespace        = "cert-manager"
  create_namespace = true
  wait             = true
  wait_for_jobs    = true
  timeout          = 300

  set {
    name  = "installCRDs"
    value = "true"
  }
  set {
    name  = "global.leaderElection.namespace"
    value = "cert-manager"
  }
  set {
    name  = "prometheus.enabled"
    value = "true"
  }
  set {
    name  = "prometheus.servicemonitor.enabled"
    value = "true"
  }
  set {
    name  = "replicaCount"
    value = "2"
  }
}

# ── Let's Encrypt ClusterIssuers ─────────────────────────────────────────────
resource "kubectl_manifest" "letsencrypt_staging" {
  yaml_body = <<-YAML
    apiVersion: cert-manager.io/v1
    kind: ClusterIssuer
    metadata:
      name: letsencrypt-staging
    spec:
      acme:
        server: https://acme-staging-v02.api.letsencrypt.org/directory
        email: ${var.letsencrypt_email}
        privateKeySecretRef:
          name: letsencrypt-staging-key
        solvers:
          - http01:
              gatewayHTTPRoute:
                parentRefs:
                  - name: kcm-gateway
                    namespace: kcm-system
                    kind: Gateway
  YAML

  depends_on = [helm_release.cert_manager]
}

resource "kubectl_manifest" "letsencrypt_prod" {
  yaml_body = <<-YAML
    apiVersion: cert-manager.io/v1
    kind: ClusterIssuer
    metadata:
      name: letsencrypt-prod
    spec:
      acme:
        server: https://acme-v02.api.letsencrypt.org/directory
        email: ${var.letsencrypt_email}
        privateKeySecretRef:
          name: letsencrypt-prod-key
        solvers:
          - http01:
              gatewayHTTPRoute:
                parentRefs:
                  - name: kcm-gateway
                    namespace: kcm-system
                    kind: Gateway
  YAML

  depends_on = [helm_release.cert_manager]
}

variable "cert_manager_version" {
  description = "cert-manager Helm chart version"
  type        = string
  default     = "v1.15.3"
}

variable "letsencrypt_email" {
  description = "Email address for Let's Encrypt ACME registration"
  type        = string
  default     = "admin@kcmchurch.org"
}

variable "kubeconfig_path" {
  description = "Path to kubeconfig"
  type        = string
  default     = "~/.kube/config"
}

output "cert_manager_version" {
  value = var.cert_manager_version
}
