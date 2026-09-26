# Runbook: Kubernetes Node & Pod Eviction Failure

## 1. Symptoms & Trigger Conditions
- Alert: `KubeNodeNotReady` or `PodDisruptionBudgetAtLimit`.
- Pods are evicted due to node resource pressure or hardware crash.

## 2. Immediate Diagnostic Actions
1. **Inspect Cluster Nodes**:
   ```bash
   kubectl get nodes -o wide
   kubectl describe node <node-name>
   ```
2. **Inspect Evicted / Pending Pods**:
   ```bash
   kubectl get pods -n kcm-system -o wide
   ```

## 3. Containment & Remediation
- **Pod Rescheduling**:
  Kubernetes HPA and PDB (`minAvailable: 1`) ensure remaining nodes keep active replicas running.
- **Node Drain / Cordon**:
  ```bash
  kubectl cordon <unhealthy-node>
  kubectl drain <unhealthy-node> --ignore-daemonsets --delete-emptydir-data
  ```

## 4. Verification
- Confirm all pods in `kcm-system` reach `Running` and `Ready (1/1)` state.
