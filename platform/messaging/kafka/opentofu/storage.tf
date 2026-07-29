resource "kubernetes_storage_class" "longhorn_kafka" {
  metadata {
    name = "longhorn-kafka"
  }
  storage_provisioner = "driver.longhorn.io"
  reclaim_policy      = "Retain"
  volume_binding_mode = "WaitForFirstConsumer"
  parameters = {
    numberOfReplicas    = "3"
    staleReplicaTimeout = "30"
    fromBackup          = ""
    fsType              = "ext4"
    dataLocality        = "best-effort"
  }
}
