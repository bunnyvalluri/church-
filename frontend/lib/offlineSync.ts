/**
 * frontend/lib/offlineSync.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Offline sync manager using IndexedDB. Keeps a queue of unsynced field event
 * reports (with base64 media) and automatically attempts to upload them
 * when internet connection is restored.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DB_NAME = "kcm_offline_reports_db";
const DB_VERSION = 1;
const STORE_NAME = "reports_queue";

export interface OfflineReport {
  id?: number;
  branchId: string;
  branchName: string;
  title: string;
  description: string;
  attendanceCount: number;
  offeringAmount: number;
  reportDate: string;
  gpsLocation: string | null;
  volunteerNames: string[];
  images: string[]; // base64 strings
  createdAt: string;
}

// Initialize IndexedDB
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Queue a report for background sync
export async function queueReport(report: Omit<OfflineReport, "id" | "createdAt">): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const item: OfflineReport = {
      ...report,
      createdAt: new Date().toISOString(),
    };
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

// Get all queued reports
export async function getQueuedReports(): Promise<OfflineReport[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Remove a report from queue
export async function removeReport(id: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Sync all queued reports with Next.js API
export async function syncOfflineReports(
  authToken: string | null,
  onProgress?: (title: string, success: boolean, error?: string) => void
): Promise<{ successCount: number; failedCount: number }> {
  const reports = await getQueuedReports();
  let successCount = 0;
  let failedCount = 0;

  if (reports.length === 0) return { successCount, failedCount };

  for (const report of reports) {
    try {
      const response = await fetch("/api/field-volunteer/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(report),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (report.id) {
          await removeReport(report.id);
        }
        successCount++;
        if (onProgress) onProgress(report.title, true);
      } else {
        failedCount++;
        if (onProgress) onProgress(report.title, false, data.error || "Server error");
      }
    } catch (err: any) {
      failedCount++;
      if (onProgress) onProgress(report.title, false, err.message || "Network error");
    }
  }

  return { successCount, failedCount };
}

// Helper hook registry function
export function registerAutoSync(getIdToken: () => Promise<string | null>, onSyncComplete?: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleOnline = async () => {
    console.info("[SYNC] Device back online. Initiating background sync...");
    try {
      const token = await getIdToken();
      const results = await syncOfflineReports(token, (title, success, error) => {
        if (success) {
          console.log(`[SYNC] Successfully synced offline report: ${title}`);
        } else {
          console.warn(`[SYNC] Failed to sync report "${title}":`, error);
        }
      });
      if (results.successCount > 0 && onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      console.error("[SYNC] Sync error:", err);
    }
  };

  window.addEventListener("online", handleOnline);
  return () => window.removeEventListener("online", handleOnline);
}
