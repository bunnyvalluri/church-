/**
 * frontend/lib/offline/indexeddb.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Enterprise IndexedDB Manager for KCM Ministries Platform.
 * Supports 20 structured object stores, automatic schema migration, typed CRUD,
 * transaction safety, and role-based data cleanup.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DB_NAME = "kcm_enterprise_offline_db";
export const DB_VERSION = 2;

export enum Stores {
  USERS = "users",
  MEMBERS = "members",
  MEMBER_PROFILES = "member_profiles",
  EVENTS = "events",
  EVENT_MEDIA_METADATA = "event_media_metadata",
  SERMONS = "sermons",
  GALLERY = "gallery",
  PRAYER_REQUESTS = "prayer_requests",
  VOLUNTEERS = "volunteers",
  ATTENDANCE = "attendance",
  ANNOUNCEMENTS = "announcements",
  NGO_PROJECTS = "ngo_projects",
  NGO_VOLUNTEERS = "ngo_volunteers",
  NOTIFICATIONS = "notifications",
  DRAFTS = "drafts",
  SYNC_QUEUE = "sync_queue",
  SYNC_CONFLICTS = "sync_conflicts",
  OFFLINE_ACTIONS = "offline_actions",
  SETTINGS = "settings",
  CACHE_METADATA = "cache_metadata",
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only accessible in browser environment."));
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;

      // 1. Users
      if (!db.objectStoreNames.contains(Stores.USERS)) {
        const store = db.createObjectStore(Stores.USERS, { keyPath: "id" });
        store.createIndex("email", "email", { unique: true });
        store.createIndex("role", "role", { unique: false });
      }

      // 2. Members
      if (!db.objectStoreNames.contains(Stores.MEMBERS)) {
        const store = db.createObjectStore(Stores.MEMBERS, { keyPath: "id" });
        store.createIndex("email", "email", { unique: false });
        store.createIndex("role", "role", { unique: false });
      }

      // 3. Member Profiles
      if (!db.objectStoreNames.contains(Stores.MEMBER_PROFILES)) {
        const store = db.createObjectStore(Stores.MEMBER_PROFILES, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: true });
      }

      // 4. Events
      if (!db.objectStoreNames.contains(Stores.EVENTS)) {
        const store = db.createObjectStore(Stores.EVENTS, { keyPath: "id" });
        store.createIndex("slug", "slug", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("branchId", "branchId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 5. Event Media Metadata
      if (!db.objectStoreNames.contains(Stores.EVENT_MEDIA_METADATA)) {
        const store = db.createObjectStore(Stores.EVENT_MEDIA_METADATA, { keyPath: "id" });
        store.createIndex("eventId", "eventId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 6. Sermons
      if (!db.objectStoreNames.contains(Stores.SERMONS)) {
        const store = db.createObjectStore(Stores.SERMONS, { keyPath: "id" });
        store.createIndex("slug", "slug", { unique: false });
        store.createIndex("speaker", "speaker", { unique: false });
        store.createIndex("category", "category", { unique: false });
      }

      // 7. Gallery
      if (!db.objectStoreNames.contains(Stores.GALLERY)) {
        const store = db.createObjectStore(Stores.GALLERY, { keyPath: "id" });
        store.createIndex("category", "category", { unique: false });
      }

      // 8. Prayer Requests
      if (!db.objectStoreNames.contains(Stores.PRAYER_REQUESTS)) {
        const store = db.createObjectStore(Stores.PRAYER_REQUESTS, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 9. Volunteers
      if (!db.objectStoreNames.contains(Stores.VOLUNTEERS)) {
        const store = db.createObjectStore(Stores.VOLUNTEERS, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 10. Attendance
      if (!db.objectStoreNames.contains(Stores.ATTENDANCE)) {
        const store = db.createObjectStore(Stores.ATTENDANCE, { keyPath: "id" });
        store.createIndex("eventId", "eventId", { unique: false });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 11. Announcements
      if (!db.objectStoreNames.contains(Stores.ANNOUNCEMENTS)) {
        const store = db.createObjectStore(Stores.ANNOUNCEMENTS, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
      }

      // 12. NGO Projects
      if (!db.objectStoreNames.contains(Stores.NGO_PROJECTS)) {
        const store = db.createObjectStore(Stores.NGO_PROJECTS, { keyPath: "id" });
        store.createIndex("slug", "slug", { unique: false });
      }

      // 13. NGO Volunteers
      if (!db.objectStoreNames.contains(Stores.NGO_VOLUNTEERS)) {
        const store = db.createObjectStore(Stores.NGO_VOLUNTEERS, { keyPath: "id" });
        store.createIndex("projectId", "projectId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 14. Notifications
      if (!db.objectStoreNames.contains(Stores.NOTIFICATIONS)) {
        const store = db.createObjectStore(Stores.NOTIFICATIONS, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
      }

      // 15. Drafts
      if (!db.objectStoreNames.contains(Stores.DRAFTS)) {
        const store = db.createObjectStore(Stores.DRAFTS, { keyPath: "id" });
        store.createIndex("formId", "formId", { unique: true });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // 16. Sync Queue
      if (!db.objectStoreNames.contains(Stores.SYNC_QUEUE)) {
        const store = db.createObjectStore(Stores.SYNC_QUEUE, { keyPath: "clientOperationId" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("entityType", "entityType", { unique: false });
      }

      // 17. Sync Conflicts
      if (!db.objectStoreNames.contains(Stores.SYNC_CONFLICTS)) {
        const store = db.createObjectStore(Stores.SYNC_CONFLICTS, { keyPath: "clientOperationId" });
        store.createIndex("resolved", "resolved", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }

      // 18. Offline Actions Log
      if (!db.objectStoreNames.contains(Stores.OFFLINE_ACTIONS)) {
        const store = db.createObjectStore(Stores.OFFLINE_ACTIONS, { keyPath: "id", autoIncrement: true });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }

      // 19. Settings
      if (!db.objectStoreNames.contains(Stores.SETTINGS)) {
        db.createObjectStore(Stores.SETTINGS, { keyPath: "key" });
      }

      // 20. Cache Metadata
      if (!db.objectStoreNames.contains(Stores.CACHE_METADATA)) {
        db.createObjectStore(Stores.CACHE_METADATA, { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ── Generic Typed Helper Functions ─────────────────────────────────────────

export async function dbPut<T = any>(storeName: Stores, value: T): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGet<T = any>(storeName: Stores, key: IDBValidKey): Promise<T | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetAll<T = any>(storeName: Stores, indexName?: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const target = indexName ? store.index(indexName) : store;
    const req = query !== undefined ? target.getAll(query) : target.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(storeName: Stores, key: IDBValidKey): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClearStore(storeName: Stores): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClearUserPrivateStores(): Promise<void> {
  const privateStores: Stores[] = [
    Stores.USERS,
    Stores.MEMBERS,
    Stores.MEMBER_PROFILES,
    Stores.PRAYER_REQUESTS,
    Stores.VOLUNTEERS,
    Stores.ATTENDANCE,
    Stores.NOTIFICATIONS,
    Stores.DRAFTS,
    Stores.SYNC_QUEUE,
    Stores.SYNC_CONFLICTS,
  ];

  for (const store of privateStores) {
    try {
      await dbClearStore(store);
    } catch (e) {
      console.warn(`[IndexedDB] Error clearing private store ${store}:`, e);
    }
  }
}
