/**
 * lib/firebaseAdmin.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Admin SDK — singleton initialisation for server-side auth.
 *
 * Two modes are supported:
 *   1. SERVICE_ACCOUNT JSON (recommended for production):
 *      Set FIREBASE_ADMIN_SERVICE_ACCOUNT = base64-encoded service account JSON
 *   2. Application Default Credentials (works automatically on Google Cloud / Cloud Run)
 *
 * If neither is available, the module falls back to "stub" mode so that the
 * rest of the app doesn't crash in pure-frontend dev setups.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { App } from 'firebase-admin/app';

let adminApp: App | null = null;
let initError: Error | null = null;

function getAdminApp(): App | null {
  if (adminApp) return adminApp;
  if (initError) return null; // Already tried and failed

  try {
    // Lazy-require to avoid import errors when the package isn't installed yet
    const { initializeApp, getApps, cert } = require('firebase-admin/app');

    if (getApps().length > 0) {
      adminApp = getApps()[0];
      return adminApp;
    }

    const b64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

    if (b64) {
      // ── Mode 1: Service Account JSON (Base-64 encoded) ─────────────────────
      const json = Buffer.from(b64, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(json);
      adminApp = initializeApp({ credential: cert(serviceAccount) });
      console.info('[FIREBASE_ADMIN] ✅ Initialised with service account credentials.');
    } else {
      // ── Mode 2: Application Default Credentials ─────────────────────────────
      // Works on Google Cloud Run, Cloud Functions, etc.
      adminApp = initializeApp();
      console.info('[FIREBASE_ADMIN] ✅ Initialised with application default credentials.');
    }

    return adminApp;
  } catch (err: any) {
    initError = err;
    console.warn(
      '[FIREBASE_ADMIN] ⚠️  Could not initialise Firebase Admin SDK:',
      err?.message || err,
      '\n  Falling back to stub mode — server-side token verification disabled.',
      '\n  To enable: set FIREBASE_ADMIN_SERVICE_ACCOUNT in .env.local'
    );
    return null;
  }
}

// ── Public helper: verify a Firebase ID token ──────────────────────────────────
export interface VerifiedToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Verifies a Firebase ID token sent from the client.
 * Returns the decoded token payload if valid, or null if invalid / SDK unavailable.
 */
export async function verifyFirebaseToken(idToken: string): Promise<VerifiedToken | null> {
  const app = getAdminApp();

  if (!app) {
    // Stub mode — log a warning and return null (caller must handle gracefully)
    console.warn('[FIREBASE_ADMIN] verifyFirebaseToken called in stub mode — token NOT verified.');
    return null;
  }

  try {
    const { getAuth } = require('firebase-admin/auth');
    const decoded = await getAuth(app).verifyIdToken(idToken, true); // checkRevoked = true
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      email_verified: decoded.email_verified,
    };
  } catch (err: any) {
    // Token expired, revoked, or tampered with
    console.warn('[FIREBASE_ADMIN] Token verification failed:', err?.message || err);
    return null;
  }
}

/**
 * Checks whether the Firebase Admin SDK is properly initialised.
 * Useful for health-check endpoints.
 */
export function isAdminReady(): boolean {
  return getAdminApp() !== null;
}
