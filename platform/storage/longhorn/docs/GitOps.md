# GitOps Management via Argo CD

## GitOps Workflow
The entire Longhorn storage stack is declaratively managed via Argo CD.

```
Git Repository (main)
  ├── platform/storage/longhorn/helm/ -----> Argo CD Application (longhorn-system)
  ├── platform/storage/longhorn/storageclasses/ -> Argo CD Application (longhorn-storageclasses)
  └── platform/storage/longhorn/argocd/ ----> ApplicationSet (longhorn-storage-appset)
```

---

## Sync Policies
- **Automated Pruning**: Enabled (`prune: true`).
- **Self-Healing**: Enabled (`selfHeal: true`). Prevents configuration drift by overwriting manual kubectl changes within 3 minutes.
- **Server Side Apply**: Enabled for seamless schema upgrades of Longhorn CRDs.
