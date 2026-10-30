/**
 * src/modules/notifications/notifications.service.ts
 * Multi-channel church notification service (FCM push, SMS, Email).
 */

import { FCMService } from '../../infrastructure/firebase/fcm';
import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';

export class NotificationsService {
  public async registerDeviceToken(userId: string, token: string, platform = 'web') {
    if (env.DB_OFFLINE) {
      return { id: `tok_mock_${Date.now()}`, token, userId, platform };
    }
    return prisma.deviceToken.upsert({
      where: { token },
      update: { userId, updatedAt: new Date() },
      create: { token, userId, platform },
    });
  }

  public async broadcastNotification(title: string, body: string, data?: Record<string, string>) {
    logger.info(`[NOTIFICATION_BROADCAST] ${title} - ${body}`);

    if (env.DB_OFFLINE) {
      return { sent: true, recipientCount: 1 };
    }

    const tokens = await prisma.deviceToken.findMany({ select: { token: true } });
    const tokenList = tokens.map((t) => t.token);

    if (tokenList.length > 0) {
      const sentCount = await FCMService.sendMulticast(tokenList, title, body, data);
      return { sent: true, recipientCount: sentCount };
    }

    return { sent: true, recipientCount: 0 };
  }
}

export const notificationsService = new NotificationsService();

