export type SyncEntity = 'ATTENDANCE' | 'PRAYER' | 'NOTE' | 'PROFILE';
export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface PendingMutation<T = any> {
  id: string;
  entity: SyncEntity;
  action: SyncAction;
  data: T;
  clientVersion: number;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  hasConflicts: boolean;
}

