import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ SECURITY: Firebase credentials come from environment variables.
// Google Sign-In is handled independently via official Google Identity Services (GIS),
// NOT through Firebase Auth.
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kcm-church-7d324.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kcm-church-7d324",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kcm-church-7d324.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "410280994688",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:410280994688:web:3c2e458191024fab890365",
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
};

// Dev-only: confirm which config source is active (never logs secret values)
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const usingEnvVars = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  console.info(
    `[FIREBASE] Config source: ${usingEnvVars ? "environment variables" : "built-in fallback"} | Project: ${firebaseConfig.projectId}`
  );
}

/**
 * Returns true if the Firebase configuration has a valid non-empty API key and project ID.
 * Use this as a pre-flight check before calling Firebase Auth APIs.
 */
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// Initialize Firebase (singleton pattern)
let app: any;
let auth: any;
let db: any;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (typeof window !== "undefined" && auth && typeof setPersistence === "function") {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
  db = getFirestore(app);
} catch (e) {
  console.error("[FIREBASE_INIT_ERROR]", e);
  db = null;
}

/**
 * Returns a guaranteed valid Firebase Auth instance on client-side.
 */
export function getFirebaseAuth() {
  if (typeof window !== "undefined") {
    if (!auth || typeof auth.onAuthStateChanged !== "function") {
      try {
        const currentApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(currentApp);
        if (typeof setPersistence === "function") {
          setPersistence(auth, browserLocalPersistence).catch(() => {});
        }
      } catch (e) {
        console.error("getFirebaseAuth client init error:", e);
      }
    }
  }
  return auth;
}

export { auth, db };

/**
 * Requests Firebase Cloud Messaging token for browser push notifications.
 */
export async function requestFCMToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    if (!app || !firebaseConfig.apiKey) return null;
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (err) {
    console.warn("[FCM] Cloud messaging token registration bypassed:", err);
    return null;
  }
}


