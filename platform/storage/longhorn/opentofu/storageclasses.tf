resource "kubernetes_storage_class" "longhorn_replicated" {
  metadata {
    name = "longhorn-replicated"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }

  storage_provisioner = "driver.longhorn.io"
  reclaim_policy      = "Delete"
  volume_binding_mode = "Immediate"
  allow_volume_expansion = true

  parameters = {
    numberOfReplicas    = tostring(var.replica_count)
    staleReplicaTimeout = "2880"
    dataLocality        = "best-effort"
    replicaAutoBalance  = "least-effort"
  }

  depends_on = [helm_release.longhorn]
}

resource "kubernetes_storage_class" "longhorn_cloudnativepg" {
  metadata {
    name = "longhorn-cloudnativepg"
  }

  storage_provisioner = "driver.longhorn.io"
  reclaim_policy      = "Retain"
  volume_binding_mode = "WaitForFirstConsumer"
  allow_volume_expansion = true

  parameters = {
    numberOfReplicas    = "3"
    staleReplicaTimeout = "4320"
    dataLocality        = "strict-local"
    replicaAutoBalance  = "least-effort"
    diskSelector        = "nvme,fast-ssd"
  }

  depends_on = [helm_release.longhorn]
}
