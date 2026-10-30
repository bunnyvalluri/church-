import { PendingMutation, SyncStatus } from './types';
import { api } from '../../services/apiClient';

const MUTATION_STORAGE_KEY = 'kcm_pending_mutations_v3';

export class OfflineSyncManager {
  private static getStoredMutations(): PendingMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(MUTATION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static setStoredMutations(mutations: PendingMutation[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MUTATION_STORAGE_KEY, JSON.stringify(mutations));
    } catch (e) {
      console.warn('[OFFLINE_SYNC] Failed to persist mutations to localStorage', e);
    }
  }

  static enqueueMutation<T>(mutation: Omit<PendingMutation<T>, 'id' | 'timestamp' | 'retryCount'>): PendingMutation<T> {
    const fullMutation: PendingMutation<T> = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const current = this.getStoredMutations();
    current.push(fullMutation);
    this.setStoredMutations(current);
    return fullMutation;
  }

  static getPendingCount(): number {
    return this.getStoredMutations().length;
  }

  static async synchronize(): Promise<{ synced: number; conflicts: number }> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return { synced: 0, conflicts: 0 };
    }

    const mutations = this.getStoredMutations();
    if (mutations.length === 0) return { synced: 0, conflicts: 0 };

    try {
      const res = await api.post<{ appliedCount: number; conflictCount: number }>('/api/offline-sync/push', {
        clientId: 'pwa_client_' + (navigator.userAgent || 'unknown'),
        mutations,
      });

      if (res.ok && res.data) {
        // Clear synced mutations
        this.setStoredMutations([]);
        return { synced: res.data.appliedCount, conflicts: res.data.conflictCount };
      }
    } catch (err) {
      console.warn('[OFFLINE_SYNC] Sync error', err);
    }

    return { synced: 0, conflicts: 0 };
  }
}
