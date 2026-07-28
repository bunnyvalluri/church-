# ==============================================================================
# Kingdom of Christ Ministries — Gateway Module Outputs
# ==============================================================================

output "gateway_version" {
  description = "Deployed Envoy Gateway version"
  value       = var.envoy_gateway_version
}

output "gateway_namespace" {
  description = "Namespace where Envoy Gateway is deployed"
  value       = kubernetes_namespace.envoy_gateway_system.metadata[0].name
}

output "gateway_external_ip" {
  description = "External IP address of the Gateway load balancer"
  value       = try(data.kubernetes_service.gateway_lb.status[0].load_balancer[0].ingress[0].ip, "pending")
}

output "gateway_helm_release_status" {
  description = "Helm release status of Envoy Gateway"
  value       = helm_release.envoy_gateway.status
}
