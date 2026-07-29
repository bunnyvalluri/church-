output "nats_service_name" {
  value       = helm_release.nats.name
  description = "Name of the deployed NATS Helm release"
}

output "nats_namespace" {
  value       = kubernetes_namespace.messaging.metadata[0].name
  description = "Namespace where NATS is running"
}

output "nats_cluster_client_url" {
  value       = "nats://nats.${var.namespace}.svc.cluster.local:4222"
  description = "Internal Kubernetes Cluster DNS URL for NATS client connections"
}
