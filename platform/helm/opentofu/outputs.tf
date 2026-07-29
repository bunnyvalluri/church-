output "provisioned_namespaces" {
  value       = [for ns in kubernetes_namespace.helm_namespaces : ns.metadata[0].name]
  description = "List of namespaces provisioned for Helm platform deployments"
}

output "argocd_release_status" {
  value       = helm_release.argocd_root.status
  description = "Status of Argo CD Root Helm Release"
}
