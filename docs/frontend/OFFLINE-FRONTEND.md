# KCM Offline-First Frontend & IndexedDB UI Synchronization

## 1. Offline User Experience Flow
```
[User Submits Prayer / Event Registration]
                    |
          (Network Connected?)
           ├── YES ──> Normal Instant Submission
           └── NO  ──> Enqueue to IndexedDB & Show Toast ("Queued for offline sync")
                            |
                     (Network Restored)
                            |
                   [Background Sync Agent]
                            |
              [Reconcile with Server & Toast Notification]
```

## 2. Real-Time Network State UI
- [`useOnlineStatus`](file:///c:/K.C.M-Portal/frontend/hooks/useOnlineStatus.ts) hook detects network transitions and displays subtle status pills (`Online`, `Offline`, `Syncing`) in the navigation bar.
