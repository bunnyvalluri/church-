/**
 * src/infrastructure/firebase/fcm.ts
 * Firebase Cloud Messaging Push Notification dispatcher.
 */

import { getFirebaseAdmin } from './admin';
import { logger } from '../../shared/logger';

export interface PushNotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class FCMService {
  public static async sendPush(payload: PushNotificationPayload): Promise<boolean> {
    const admin = getFirebaseAdmin();
    if (!admin) {
      logger.debug('[FCM] Firebase Admin not configured. Push skipped in offline mode.');
      return false;
    }

    try {
      await admin.messaging().send({
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      });
      return true;
    } catch (err: any) {
      logger.warn(`[FCM] Push send failure: ${err.message}`);
      return false;
    }
  }

  public static async sendMulticast(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<number> {
    const admin = getFirebaseAdmin();
    if (!admin || tokens.length === 0) return 0;

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data || {},
      });
      return response.successCount;
    } catch (err: any) {
      logger.warn(`[FCM] Multicast push error: ${err.message}`);
      return 0;
    }
  }
}

