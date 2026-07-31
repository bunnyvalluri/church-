/**
 * frontend/lib/loops/offlineSyncLoop.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 6: Client-Side Offline Sync Detector & IndexedDB Engine
 * Ingests offline drafts -> Verifies nonces -> Syncs to PostgreSQL backend.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface OfflineRecord {
  id: string; // Nonce (uuid-v4)
  type: 'ATTENDANCE' | 'DONATION' | 'EVENT_REGISTRATION' | 'PRAYER_REQUEST';
  payload: Record<string, any>;
  clientTimestamp: string;
}

const DB_NAME = 'kcm_offline_store';
const STORE_NAME = 'pending_records';

/**
 * Open or create IndexedDB database.
 */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB unavailable.'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save offline record to IndexedDB with unique nonce.
 */
export async function enqueueOfflineRecord(type: OfflineRecord['type'], payload: Record<string, any>): Promise<string> {
  const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const record: OfflineRecord = {
    id: nonce,
    type,
    payload,
    clientTimestamp: new Date().toISOString(),
  };

  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    console.log(`[OFFLINE_SYNC] Saved draft record to IndexedDB with nonce: ${nonce}`);
    return nonce;
  } catch (err) {
    console.warn(`[OFFLINE_SYNC] Failed to store offline record: ${(err as Error).message}`);
    throw err;
  }
}

/**
 * Read and sync pending IndexedDB records to server.
 */
export async function triggerOfflineSyncLoop(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const records: OfflineRecord[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (records.length === 0) return { synced: 0, failed: 0 };

    console.log(`[OFFLINE_SYNC] [OBSERVE] Detected ${records.length} pending IndexedDB records. Initiating sync to server...`);

    const response = await fetch('/api/sync/offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: records }),
    });

    if (!response.ok) {
      throw new Error(`Sync API responded with status ${response.status}`);
    }

    const data = await response.json();
    const processedNonces: string[] = data.processedNonces || [];

    // Delete synced records from IndexedDB
    if (processedNonces.length > 0) {
      const deleteTx = db.transaction(STORE_NAME, 'readwrite');
      const deleteStore = deleteTx.objectStore(STORE_NAME);
      processedNonces.forEach((nonce) => deleteStore.delete(nonce));
      console.log(`[OFFLINE_SYNC] Successfully reconciled and cleared ${processedNonces.length} records from IndexedDB.`);
    }

    return { synced: processedNonces.length, failed: records.length - processedNonces.length };
  } catch (err) {
    console.warn(`[OFFLINE_SYNC] Sync loop error: ${(err as Error).message}`);
    return { synced: 0, failed: 0 };
  }
}

/**
 * Register automatic browser online event listener.
 */
export function registerOfflineSyncListener() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('[OFFLINE_SYNC] Network restored. Triggering Offline Sync Loop...');
      triggerOfflineSyncLoop();
    });
  }
}
