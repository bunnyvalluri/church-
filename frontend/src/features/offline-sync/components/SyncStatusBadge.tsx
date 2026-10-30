'use client';

import * as React from 'react';
import { Badge } from '../../../components/ui/FeedbackDisplay';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { OfflineSyncManager } from '../syncManager';

export const SyncStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [pending, setPending] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    setPending(OfflineSyncManager.getPendingCount());

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const triggerSync = async () => {
      setSyncing(true);
      await OfflineSyncManager.synchronize();
      setPending(OfflineSyncManager.getPendingCount());
      setSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && pending === 0) {
    return (
      <Badge variant="success" className="flex items-center space-x-1.5 py-1">
        <Wifi className="h-3 w-3" />
        <span>Connected</span>
      </Badge>
    );
  }

  if (!isOnline) {
    return (
      <Badge variant="warning" className="flex items-center space-x-1.5 py-1">
        <WifiOff className="h-3 w-3" />
        <span>Offline Mode ({pending} queued)</span>
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="flex items-center space-x-1.5 py-1">
      <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
      <span>Syncing ({pending} pending)</span>
    </Badge>
  );
};

