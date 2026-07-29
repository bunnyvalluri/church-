output "namespace_name" {
  value       = kubernetes_namespace_v1.trivy_system.metadata[0].name
  description = "Name of the created trivy-system namespace"
}

output "helm_release_status" {
  value       = helm_release.trivy_operator.status
  description = "Status of the Trivy Operator Helm release deployment"
}

output "helm_release_version" {
  value       = helm_release.trivy_operator.version
  description = "Deployed chart version of trivy-operator"
}
