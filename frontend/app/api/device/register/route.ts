import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/device/register — Save or update FCM device token
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, userId, deviceType = "web", platform = "browser" } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Device token is required." }, { status: 400 });
    }

    const deviceTokenModel = (prisma as any).deviceToken;
    if (!deviceTokenModel) {
      return NextResponse.json({ success: true, message: "Device token table not available." });
    }

    const deviceToken = await deviceTokenModel.upsert({
      where: { token },
      update: {
        userId: userId || undefined,
        deviceType,
        platform,
        lastUsedAt: new Date(),
      },
      create: {
        token,
        userId: userId || undefined,
        deviceType,
        platform,
      },
    });

    return NextResponse.json({ success: true, deviceToken });
  } catch (err: any) {
    console.error("[API/DEVICE/REGISTER] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register device token." },
      { status: 500 }
    );
  }
}
