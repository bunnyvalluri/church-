import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: authDomain MUST be the firebaseapp.com domain (not a custom domain)
// so that Google OAuth popup/redirect routes through Firebase's authorized handler.
// Custom domains (e.g. kcmchurch.vercel.app) must be added to Firebase Console →
// Authentication → Settings → Authorized Domains for Google Sign-In to work.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC8T9sYPcS6NlCoz6e2RG5pQleLxmNOixI",
  // Always use the Firebase-hosted auth domain for OAuth to work from any deployment
  authDomain: "kcm-church-2f3d5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kcm-church-2f3d5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kcm-church-2f3d5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "850005700914",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:850005700914:web:eef50ca2e053a5e5f8a72b",
};

// Safety check for missing config
if (!firebaseConfig.apiKey) {
  console.warn("Firebase Config missing! Login will not work locally.");
}

// Initialize Firebase (singleton pattern) with fallback
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
  googleProvider.setCustomParameters({ prompt: "select_account" });
  googleProvider.addScope("email");
  googleProvider.addScope("profile");
  facebookProvider = new FacebookAuthProvider();
  twitterProvider = new TwitterAuthProvider();
} catch (e) {
  console.error("Firebase Init Error:", e);
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
  provider.setCustomParameters({ prompt: "select_account" });
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


