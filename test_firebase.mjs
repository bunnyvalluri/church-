import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

console.log("Firebase App functions:", typeof initializeApp, typeof getApps, typeof getApp);
console.log("Firebase Auth function:", typeof getAuth);
console.log("Firebase Firestore function:", typeof getFirestore);

try {
  const app = initializeApp({ apiKey: "mock" });
  const auth = getAuth(app);
  const db = getFirestore(app);
  console.log("Initialization succeeded!", typeof auth, typeof db);
} catch (e) {
  console.error("Error during initialization:", e);
}
