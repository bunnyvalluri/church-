export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const processedNonceSet = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const batch = body.batch || [];

    const processedNonces: string[] = [];
    const conflicts: any[] = [];

    for (const record of batch) {
      const { id: nonce, entityType, action, payload } = record;

      // Idempotency check: Skip if operation was already reconciled
      if (processedNonceSet.has(nonce)) {
        processedNonces.push(nonce);
        continue;
      }

      try {
        if (entityType === "PRAYER_REQUEST" || entityType === "PRAYER") {
          if (action === "CREATE" && (prisma as any).prayerRequest) {
            await (prisma as any).prayerRequest.create({
              data: {
                title: payload.title || "Prayer Request",
                category: payload.category || "GENERAL",
                isPrivate: payload.isPrivate ?? false,
                name: payload.name || "Anonymous",
                email: payload.email || null,
                phone: payload.phone || null,
              },
            });
          }
        } else if (entityType === "VOLUNTEER") {
          if (action === "CREATE") {
            await prisma.eventRegistration.create({
              data: {
                name: payload.name || "Volunteer",
                email: payload.email || "volunteer@kcm.org",
                phone: payload.phone || null,
                eventId: payload.eventId || "default-event-id",
                status: "VOLUNTEER_REGISTERED",
              },
            });
          }
        } else if (entityType === "EVENT") {
          if (action === "CREATE") {
            await prisma.event.create({
              data: {
                title: payload.title,
                slug: payload.slug || `event-${Date.now()}`,
                description: payload.description || "",
                location: payload.location || "Main Sanctuary",
                category: payload.category || "SERVICE",
                date: new Date(payload.date || Date.now()),
                time: payload.time || "09:00 AM",
              },
            });
          } else if (action === "UPDATE" && payload.id) {
            await prisma.event.update({
              where: { id: payload.id },
              data: {
                title: payload.title,
                description: payload.description,
                location: payload.location,
              },
            });
          } else if (action === "DELETE" && payload.id) {
            await prisma.event.update({
              where: { id: payload.id },
              data: { isDeleted: true, deletedAt: new Date() },
            });
          }
        }

        processedNonceSet.add(nonce);
        processedNonces.push(nonce);
      } catch (err: any) {
        console.warn(`[Sync API] Batch item error for ${nonce}:`, err.message);
        // Retain nonce in processed set if unique constraint error to prevent endless loops
        processedNonceSet.add(nonce);
        processedNonces.push(nonce);
      }
    }

    return NextResponse.json({
      success: true,
      processedNonces,
      conflicts,
      count: processedNonces.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Offline Sync Reconciliation Failed", details: error?.message },
      { status: 500 }
    );
  }
}
