import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// POST /api/notifications/send — Dispatch live socket popup and FCM push notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, branchName, link, popupType = "new-event" } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    // 1. Trigger Socket.io real-time broadcast via backend companion server
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notification:popup",
          payload: {
            title,
            description: description || `Branch: ${branchName || "General"}`,
            branchName,
            popupType,
            link: link || "/event-manager",
            timestamp: new Date(),
          },
        }),
      });
    } catch (socketErr) {
      console.warn("[API/NOTIFICATIONS/SEND] Socket broadcast warning:", socketErr);
    }

    // 2. Fetch active FCM device tokens from PostgreSQL DB
    const deviceTokenModel = (prisma as any).deviceToken;
    const deviceRecords = deviceTokenModel
      ? await deviceTokenModel.findMany({ select: { token: true }, take: 500 })
      : [];
    const tokens = deviceRecords.map((d: any) => d.token);

    let pushResult = { successCount: 0, failureCount: 0 };
    if (tokens.length > 0) {
      pushResult = await sendPushNotification(
        tokens,
        title,
        description || `New activity recorded at ${branchName || "Church Portal"}`,
        { link: link || "/event-manager", branchName: branchName || "" }
      );
    }

    // 3. Persist notification entry in database
    const notification = await prisma.notification.create({
      data: {
        type: popupType,
        title,
        content: description || `Event update for ${branchName || "General"}`,
        link: link || "/event-manager",
      },
    });

    return NextResponse.json({
      success: true,
      notification,
      recipientsCount: tokens.length,
      pushResult,
    });
  } catch (err: any) {
    console.error("[API/NOTIFICATIONS/SEND] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send notifications." },
      { status: 500 }
    );
  }
}
