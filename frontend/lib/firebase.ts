import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC8T9sYPcS6NlCoz6e2RG5pQleLxmNOixI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kcm-church-2f3d5.firebaseapp.com",
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
  // Mock auth and db to prevent crash
  auth = { currentUser: null };
  db = null;
  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
  twitterProvider = new TwitterAuthProvider();
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


