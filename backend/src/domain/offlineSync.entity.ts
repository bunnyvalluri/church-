/**
 * src/domain/offlineSync.entity.ts
 * Domain model for offline data mutation packets, version checking, and conflict resolution.
 */

import { BadRequestError, ConflictError } from '../shared/errors';

export type MutationOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface MutationPacket {
  id: string;
  table: string;
  recordId: string;
  operation: MutationOperation;
  payload: Record<string, any>;
  clientTimestamp: number;
  clientVersion: number;
}

export class OfflineSyncBatch {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
    public readonly mutations: MutationPacket[],
    public readonly batchTimestamp: number = Date.now()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.deviceId) throw new BadRequestError('Device ID is required for sync batches.');
    if (!Array.isArray(this.mutations) || this.mutations.length === 0) {
      throw new BadRequestError('Sync batch must contain at least one mutation.');
    }
  }

  /**
   * Evaluates optimistic concurrency version conflict against server state.
   */
  public static verifyConcurrencyVersion(clientVersion: number, serverVersion: number): void {
    if (clientVersion < serverVersion) {
      throw new ConflictError(
        `Version conflict detected. Server version (${serverVersion}) is ahead of client version (${clientVersion}).`
      );
    }
  }
}

