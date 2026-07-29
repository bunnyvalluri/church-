# ==============================================================================
# Kingdom of Christ Ministries — OpenTofu Gateway Module Instantiation (Ph 13)
# ==============================================================================

# ── cert-manager (prerequisite for TLS) ───────────────────────────────────────
module "cert_manager" {
  source = "./modules/cert-manager"

  kubeconfig_path      = var.kubeconfig_path
  cert_manager_version = var.cert_manager_version
  letsencrypt_email    = var.letsencrypt_email
}

# ── Envoy Gateway ─────────────────────────────────────────────────────────────
module "envoy_gateway" {
  source = "./modules/gateway"

  kubeconfig_path       = var.kubeconfig_path
  envoy_gateway_version = var.envoy_gateway_version
  gateway_namespace     = var.gateway_namespace
  gateway_replicas      = var.gateway_replicas
  enable_hpa            = var.enable_hpa

  # Wait for cert-manager to be ready before deploying gateway
  depends_on = [module.cert_manager]
}

# ── DNS Records (optional — comment out if DNS is managed externally) ─────────
# module "dns" {
#   source = "./modules/dns"
#
#   gateway_ip     = module.envoy_gateway.gateway_external_ip
#   domain         = var.domain
#   subdomains     = var.subdomains
#   dns_provider   = var.dns_provider
#   depends_on     = [module.envoy_gateway]
# }

# ── Outputs ───────────────────────────────────────────────────────────────────
output "envoy_gateway_version" {
  value       = module.envoy_gateway.gateway_version
  description = "Deployed Envoy Gateway version"
}

output "gateway_external_ip" {
  value       = module.envoy_gateway.gateway_external_ip
  description = "External IP of the Gateway load balancer"
  sensitive   = false
}

output "cert_manager_version" {
  value       = module.cert_manager.cert_manager_version
  description = "Deployed cert-manager version"
}
