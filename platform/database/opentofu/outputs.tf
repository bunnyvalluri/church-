output "cluster_name" {
  value       = "kcm-db-cluster"
  description = "Name of deployed CloudNativePG Cluster"
}

output "rw_service_endpoint" {
  value       = "kcm-db-cluster-rw.kcm-database.svc.cluster.local:5432"
  description = "Primary Read-Write connection endpoint"
}

output "ro_service_endpoint" {
  value       = "kcm-db-cluster-ro.kcm-database.svc.cluster.local:5432"
  description = "Replica Read-Only connection endpoint"
}

output "pgbouncer_rw_endpoint" {
  value       = "kcm-db-pooler-rw.kcm-database.svc.cluster.local:5432"
  description = "PgBouncer Read-Write pooler service endpoint"
}
