import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
  twitterProvider = new TwitterAuthProvider();
} catch (e) {
  console.error("Firebase Init Error:", e);
  // Mock auth and db to prevent crash
  auth = { currentUser: null };
  db = null;
  googleProvider = {};
  facebookProvider = {};
  twitterProvider = {};
}

export { auth, db, googleProvider, facebookProvider, twitterProvider };

