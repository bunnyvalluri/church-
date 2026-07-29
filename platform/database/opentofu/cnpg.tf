resource "helm_release" "cloudnative_pg_operator" {
  name             = "cloudnative-pg"
  repository       = "https://cloudnative-pg.github.io/charts"
  chart            = "cloudnative-pg"
  version          = "0.20.0"
  namespace        = "cnpg-system"
  create_namespace = true

  set {
    name  = "config.management.leaderElection"
    value = "true"
  }
}

resource "kubernetes_manifest" "kcm_db_cluster" {
  depends_on = [helm_release.cloudnative_pg_operator]

  manifest = {
    apiVersion = "postgresql.cnpg.io/v1"
    kind       = "Cluster"
    metadata = {
      name      = "kcm-db-cluster"
      namespace = var.namespace
      labels = {
        "app.kubernetes.io/name"    = "kcm-postgresql"
        "app.kubernetes.io/part-of" = "kcm-database-platform"
      }
    }
    spec = {
      instances = var.cluster_instances
      imageName = "ghcr.io/cloudnative-pg/postgresql:16.2"
      storage = {
        size         = var.storage_size
        storageClass = "kcm-nvme-sc"
      }
      bootstrap = {
        initdb = {
          database = "kcm_portal_db"
          owner    = "kcm_app_user"
          secret = {
            name = "kcm-db-app-secret"
          }
        }
      }
      superuserSecret = {
        name = "kcm-db-superuser-secret"
      }
    }
  }
}
