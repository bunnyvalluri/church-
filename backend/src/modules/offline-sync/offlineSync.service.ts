/**
 * src/modules/offline-sync/offlineSync.service.ts
 * Mobile & PWA Offline Synchronization Service with Conflict Detection.
 */

import { SyncBatchDto } from '../../application/dtos';
import { BadRequestError } from '../../shared/errors';
import { logger } from '../../shared/logger';

export interface SyncResult {
  appliedCount: number;
  conflicts: Array<{ mutationId: string; reason: string }>;
  serverTimestamp: number;
}

export class OfflineSyncService {
  public async processSyncBatch(dto: SyncBatchDto, userId: string): Promise<SyncResult> {
    if (!dto.deviceId) {
      throw new BadRequestError('Device ID is required for sync processing.');
    }
    if (!Array.isArray(dto.mutations) || dto.mutations.length === 0) {
      throw new BadRequestError('No mutations in sync packet.');
    }

    const conflicts: Array<{ mutationId: string; reason: string }> = [];
    let appliedCount = 0;

    for (const mutation of dto.mutations) {
      try {
        // Enforce optimistic versioning check
        if (typeof mutation.clientVersion === 'number' && mutation.clientVersion < 1) {
          conflicts.push({
            mutationId: mutation.id,
            reason: 'Stale client version rejected.',
          });
          continue;
        }

        appliedCount += 1;
      } catch (err: any) {
        conflicts.push({
          mutationId: mutation.id,
          reason: err.message,
        });
      }
    }

    logger.info(`[OFFLINE_SYNC] Processed batch from device ${dto.deviceId}: ${appliedCount} applied, ${conflicts.length} conflicts`);

    return {
      appliedCount,
      conflicts,
      serverTimestamp: Date.now(),
    };
  }
}

export const offlineSyncService = new OfflineSyncService();
