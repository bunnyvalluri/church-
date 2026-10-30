/**
 * src/infrastructure/firebase/admin.ts
 * Firebase Admin SDK singleton for token verification and push delivery.
 */

import admin from 'firebase-admin';
import { servicesConfig } from '../../config/services';
import { logger } from '../../shared/logger';

let initialized = false;

export function getFirebaseAdmin(): typeof admin | null {
  if (initialized && admin.apps.length > 0) {
    return admin;
  }

  const { projectId, serviceAccount } = servicesConfig.firebase;

  try {
    if (serviceAccount) {
      const decodedJson = serviceAccount.startsWith('{')
        ? JSON.parse(serviceAccount)
        : JSON.parse(Buffer.from(serviceAccount, 'base64').toString('utf8'));

      admin.initializeApp({
        credential: admin.credential.cert(decodedJson),
        projectId: projectId || decodedJson.project_id,
      });
      initialized = true;
      logger.info('[FIREBASE] Admin initialized with service account.');
      return admin;
    }

    if (projectId) {
      admin.initializeApp({
        projectId,
      });
      initialized = true;
      logger.info('[FIREBASE] Admin initialized with Project ID.');
      return admin;
    }
  } catch (err: any) {
    logger.warn(`[FIREBASE] Admin initialization skipped: ${err.message}`);
  }

  return admin.apps.length > 0 ? admin : null;
}

export async function verifyFirebaseIdToken(token: string): Promise<admin.auth.DecodedIdToken | null> {
  const firebase = getFirebaseAdmin();
  if (!firebase) return null;
  try {
    return await firebase.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

