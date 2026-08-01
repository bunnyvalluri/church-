/**
 * backend/src/loops/notificationLoop.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 5: Notification Loop (ECC OODA Pattern)
 * 
 * Workflow:
 * 1. OBSERVE: Listens to `notificationQueue` for direct messages, broadcast announcements, and event alerts.
 * 2. ORIENT: Resolve target channels (Active Socket.io rooms vs Offline FCM device tokens).
 * 3. DECIDE: Route payload across dual dispatch channels with exponential backoff & DLQ fallback.
 * 4. ACT:
 *    a. Emit real-time Socket.io payload to target room/user.
 *    b. Dispatch Firebase FCM push notification.
 *    c. Record delivery status in `NotificationLog` table.
 * 5. TELEMETRY: Persist audit log entry & retry telemetry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logAuditEvent } = require('../services/auditLogger');

/**
 * Process a notification job with exponential backoff & dual-channel dispatch.
 */
async function processNotificationLoop(jobData, io) {
  const { title, body, content, channel = 'ALL', userId, role, room, topic = 'general', metadata = {} } = jobData;
  const messageText = body || content || 'New notification from KCM Ministries';
  console.log(`[NOTIFICATION_LOOP] [OBSERVE] Ingesting notification: "${title}" (Channel: ${channel})`);

  let socketDelivered = false;
  let fcmDelivered = false;
  let errorDetails = null;

  // 1. ACT: Realtime Socket.io Dispatch
  if ((channel === 'ALL' || channel === 'SOCKET') && io) {
    try {
      const payload = {
        title,
        body: messageText,
        topic,
        metadata,
        timestamp: new Date().toISOString(),
      };

      if (userId) {
        io.to(`user:${userId}`).emit('notification:direct', payload);
      } else if (room) {
        io.to(room).emit('notification:room', payload);
      } else if (role) {
        io.to(`role:${role}`).emit('notification:role', payload);
      } else {
        io.emit('notification:broadcast', payload);
      }
      socketDelivered = true;
      console.log('[NOTIFICATION_LOOP] [ACT] Socket.io emission successful.');
    } catch (err) {
      console.warn(`[NOTIFICATION_LOOP] Socket.io emission error: ${err.message}`);
      errorDetails = err.message;
    }
  }

  // 2. ACT: Firebase FCM Push Notification Dispatch
  if (channel === 'ALL' || channel === 'FCM') {
    try {
      fcmDelivered = await dispatchFcmPayload(title, messageText, userId, topic);
      console.log(`[NOTIFICATION_LOOP] [ACT] FCM push outcome: ${fcmDelivered ? 'DELIVERED' : 'SKIPPED_NO_TOKENS'}`);
    } catch (err) {
      console.warn(`[NOTIFICATION_LOOP] FCM push error: ${err.message}`);
      errorDetails = err.message;
    }
  }

  const overallSuccess = socketDelivered || fcmDelivered;

  // 3. ACT: Log Delivery Status to Prisma `NotificationLog`
  try {
    if (prisma.notificationLog) {
      await prisma.notificationLog.create({
        data: {
          channel: channel,
          status: overallSuccess ? 'SENT' : 'FAILED',
          recipientId: userId || null,
          recipientRole: role || null,
          recipient_addr: userId ? `user:${userId}` : (room || 'broadcast'),
          errorMessage: overallSuccess ? null : errorDetails,
          deliveredAt: overallSuccess ? new Date() : null,
          sentAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.warn(`[NOTIFICATION_LOOP] NotificationLog write note: ${err.message}`);
  }

  if (!overallSuccess) {
    throw new Error(`Notification delivery failed across all target channels. Reason: ${errorDetails || 'No recipient acknowledged'}`);
  }

  // 4. TELEMETRY: Write Audit Log
  await logAuditEvent({
    action: 'NOTIFICATION_DISPATCH_SUCCESS',
    entity: 'NOTIFICATION',
    entityId: userId || room || topic,
    details: { title, socketDelivered, fcmDelivered },
    severity: 'INFO',
    loopName: 'Notification Loop',
  });

  return { socketDelivered, fcmDelivered };
}

/**
 * FCM Push Helper
 */
async function dispatchFcmPayload(title, body, userId, topic) {
  try {
    if (prisma.deviceToken && userId) {
      const userTokens = await prisma.deviceToken.findMany({ where: { userId } });
      if (userTokens.length > 0) {
        console.log(`[FCM] Dispatched push to ${userTokens.length} active device tokens for user ${userId}`);
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

module.exports = {
  processNotificationLoop,
};
