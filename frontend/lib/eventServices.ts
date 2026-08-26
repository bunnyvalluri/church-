/**
 * frontend/lib/eventServices.ts
 * Centralized notification, socket, and logging services for the Event Management System.
 */

import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebaseAdmin";
import { emailService } from "@/lib/email";

const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const resendKey = process.env.RESEND_API_KEY || "";

/**
 * Trigger a Socket.IO broadcast via companion companion server.
 */
export async function triggerSocketBroadcast(type: string, payload: any) {
  try {
    const res = await fetch(`${companionUrl}/api/trigger-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
    if (!res.ok) {
      console.warn(`[SOCKET BROADCAST] Companion server responded with status: ${res.status}`);
    }
  } catch (err: any) {
    console.error(`[SOCKET BROADCAST] Error contacting companion server:`, err.message);
  }
}

/**
 * Log an action in the database AuditLog table.
 */
export async function logAuditEvent(userId: string | null, action: string, details: string, ipAddress?: string, userAgent?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (err: any) {
    console.error("[AUDIT LOG] Failed to write audit log:", err.message);
  }
}

/**
 * Broadcast FCM Push notifications to all registered device tokens.
 */
export async function sendEventPushNotification(title: string, body: string, link: string, eventId: string) {
  try {
    const deviceRecords = await prisma.deviceToken.findMany({
      select: { token: true },
      take: 500,
    });
    const tokens = deviceRecords.map((d) => d.token);
    
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, body, { link, eventId });
      console.info(`[FCM PUSH] Multicast notification sent to ${tokens.length} tokens.`);
    }
  } catch (err: any) {
    console.warn("[FCM PUSH] Error dispatching push notifications:", err.message);
  }
}

/**
 * Send an email notification via Resend.
 */
export async function sendEmailNotification(to: string, subject: string, htmlContent: string) {
  if (!resendKey) {
    console.info("[EMAIL SERVICE] Resend API key not configured. Skipping email dispatch.");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "KCM Ministries <onboarding@resend.dev>", // default mock sender
        to,
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[EMAIL SERVICE] Resend responded with error: ${errorText}`);
    } else {
      console.info(`[EMAIL SERVICE] Email dispatched successfully to ${to}.`);
    }
  } catch (err: any) {
    console.error("[EMAIL SERVICE] Failed to dispatch email:", err.message);
  }
}

/**
 * Automatically notifies members via website popup, FCM push, database, and email.
 */
export async function notifyEventActivity(
  eventId: string,
  type: "NEW_EVENT" | "EVENT_UPDATED" | "EVENT_CANCELLED" | "REMINDER" | "STARTING_SOON",
  title: string,
  content: string,
  link: string,
  eventDetails: { title: string; location: string; date: Date; coverImage?: string }
) {
  try {
    // 1. Create a database Notification record
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        content,
        link,
      },
    });

    // 2. Log database notification logs for relevant members (optional, standard logging)
    await prisma.eventNotification.create({
      data: {
        eventId,
        type,
        title,
        content,
        channels: ["EMAIL", "PUSH", "WEBSITE"],
      },
    });

    // 3. Trigger Socket.IO real-time popup on the website
    await triggerSocketBroadcast("notification:popup", {
      popupType: type === "NEW_EVENT" ? "new-event" : "custom",
      title,
      description: content,
      timestamp: new Date(),
      icon: "event",
      link,
    });

    // 4. Send FCM Push Notification
    await sendEventPushNotification(title, content, link, eventId);

    // 5. If it's a cancellation, reminder, or update, email registered attendees
    if (type === "EVENT_CANCELLED" || type === "REMINDER" || type === "STARTING_SOON" || type === "EVENT_UPDATED") {
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId, status: "REGISTERED" },
        select: { email: true, name: true, userId: true },
      });

      const formattedDate = new Date(eventDetails.date).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const eventUrl = `${process.env.NEXTAUTH_URL || "https://kcmchurch.vercel.app"}${link}`;

      for (const reg of registrations) {
        if (!reg.email) continue;
        const firstName = reg.name ? reg.name.split(' ')[0] : 'Member';

        if (type === "EVENT_CANCELLED") {
          emailService.send({
            template: "EVENT_CANCELLED",
            to: reg.email,
            userId: reg.userId || undefined,
            eventId,
            data: {
              email: reg.email,
              firstName,
              eventName: eventDetails.title,
              eventDate: formattedDate,
              cancellationReason: content,
              calendarUrl: `${process.env.NEXTAUTH_URL || "https://kcmchurch.vercel.app"}/events`,
            },
          }).catch(() => {});
        } else if (type === "EVENT_UPDATED") {
          emailService.send({
            template: "EVENT_UPDATED",
            to: reg.email,
            userId: reg.userId || undefined,
            eventId,
            data: {
              email: reg.email,
              firstName,
              eventName: eventDetails.title,
              eventDate: formattedDate,
              eventLocation: eventDetails.location,
              updateSummary: content,
              eventUrl,
            },
          }).catch(() => {});
        } else {
          // REMINDER or STARTING_SOON
          emailService.send({
            template: "EVENT_REMINDER",
            to: reg.email,
            userId: reg.userId || undefined,
            eventId,
            data: {
              email: reg.email,
              firstName,
              eventName: eventDetails.title,
              eventDate: formattedDate,
              eventLocation: eventDetails.location,
              eventUrl,
            },
          }).catch(() => {});
        }
      }
    }
  } catch (err: any) {
    console.error("[EVENT NOTIFICATIONS] Error broadcasting notifications:", err.message);
  }
}
