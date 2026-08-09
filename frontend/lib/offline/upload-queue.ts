/**
 * frontend/lib/offline/upload-queue.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Offline Media Upload Queue (Cloudinary Staging Buffer).
 * Captures image/video blobs offline in IndexedDB and uploads when back online.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Stores, dbDelete, dbGet, dbGetAll, dbPut } from "./indexeddb";
import { networkManager } from "./network-manager";
import { offlineEventBus } from "./offline-events";

export interface PendingMediaUpload {
  id: string;
  eventId?: string;
  sermonId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string; // Base64 data URL
  caption?: string;
  status: "PENDING_UPLOAD" | "UPLOADING" | "UPLOADED" | "FAILED";
  retryCount: number;
  uploadedUrl?: string;
  createdAt: string;
  error?: string;
}

export class UploadQueueManager {
  async queueUpload(upload: Omit<PendingMediaUpload, "id" | "status" | "retryCount" | "createdAt">): Promise<PendingMediaUpload> {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record: PendingMediaUpload = {
      ...upload,
      id,
      status: "PENDING_UPLOAD",
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    await dbPut(Stores.EVENT_MEDIA_METADATA, record);
    offlineEventBus.emit("upload-queue-changed", { action: "queued", id });
    return record;
  }

  async getPendingUploads(): Promise<PendingMediaUpload[]> {
    const all = await dbGetAll<PendingMediaUpload>(Stores.EVENT_MEDIA_METADATA);
    return all.filter((u) => u.status === "PENDING_UPLOAD" || u.status === "FAILED");
  }

  async processUploadQueue(): Promise<{ successCount: number; failedCount: number }> {
    if (!networkManager.isOnline()) {
      return { successCount: 0, failedCount: 0 };
    }

    const pending = await this.getPendingUploads();
    let successCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      item.status = "UPLOADING";
      await dbPut(Stores.EVENT_MEDIA_METADATA, item);

      try {
        const formData = new FormData();
        // Convert Base64 back to Blob for multipart upload
        const fetchRes = await fetch(item.dataUrl);
        const blob = await fetchRes.blob();
        formData.append("file", blob, item.fileName);
        if (item.caption) formData.append("caption", item.caption);
        if (item.eventId) formData.append("eventId", item.eventId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const resData = await uploadRes.json();

        if (uploadRes.ok && (resData.url || resData.secure_url)) {
          item.status = "UPLOADED";
          item.uploadedUrl = resData.url || resData.secure_url;
          await dbPut(Stores.EVENT_MEDIA_METADATA, item);
          successCount++;
        } else {
          item.status = "FAILED";
          item.retryCount += 1;
          item.error = resData.error || "Cloudinary upload failed";
          await dbPut(Stores.EVENT_MEDIA_METADATA, item);
          failedCount++;
        }
      } catch (err: any) {
        item.status = "FAILED";
        item.retryCount += 1;
        item.error = err.message || "Network upload error";
        await dbPut(Stores.EVENT_MEDIA_METADATA, item);
        failedCount++;
      }
    }

    offlineEventBus.emit("upload-queue-changed", { action: "processed", successCount, failedCount });
    return { successCount, failedCount };
  }

  async removeUpload(id: string): Promise<void> {
    await dbDelete(Stores.EVENT_MEDIA_METADATA, id);
    offlineEventBus.emit("upload-queue-changed", { action: "removed", id });
  }
}

export const uploadQueueManager = new UploadQueueManager();
