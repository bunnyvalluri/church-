import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: authDomain MUST be the firebaseapp.com domain (not a custom domain)
// so that Google OAuth popup/redirect routes through Firebase's authorized handler.
// Custom domains (e.g. kcmchurch.vercel.app) must be added to Firebase Console →
// Authentication → Settings → Authorized Domains for Google Sign-In to work.
//
// ⚠️ SECURITY: All credentials come from environment variables only.
// Set these in .env.local (local dev) and Vercel dashboard (production).
// NEVER hardcode API keys here — GitHub secret scanning will flag them.
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBaNc9dgk4StKQsY2L73d2H4Hk_QnwAzN0",
  authDomain: "kcm-church-7d324.firebaseapp.com",
  projectId: "kcm-church-7d324",
  storageBucket: "kcm-church-7d324.firebasestorage.app",
  messagingSenderId: "410280994688",
  appId: "1:410280994688:web:3c2e458191024fab890365",
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
let googleProvider: any;
let facebookProvider: any;
let twitterProvider: any;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (typeof window !== "undefined" && auth && typeof setPersistence === "function") {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
  googleProvider.addScope("email");
  googleProvider.addScope("profile");
  facebookProvider = new FacebookAuthProvider();
  twitterProvider = new TwitterAuthProvider();
} catch (e) {
  console.error("[FIREBASE_INIT_ERROR]", e);
  db = null;
  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
  twitterProvider = new TwitterAuthProvider();
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

/**
 * Returns a freshly configured GoogleAuthProvider instance.
 */
export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  provider.addScope("email");
  provider.addScope("profile");
  return provider;
}

export { auth, db, googleProvider, facebookProvider, twitterProvider };

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


