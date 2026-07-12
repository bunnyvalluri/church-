import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { z } from "zod";
import { triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

const EventReportSchema = z.object({
  attendanceCount: z.number().nonnegative(),
  offeringAmount: z.number().nonnegative(),
  visitorsCount: z.number().nonnegative().default(0),
  newMembersCount: z.number().nonnegative().default(0),
  prayerRequestsCount: z.number().nonnegative().default(0),
  expenses: z.number().nonnegative().default(0),
  comments: z.string().optional().nullable(),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  photos: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = EventReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const {
      attendanceCount,
      offeringAmount,
      visitorsCount,
      newMembersCount,
      prayerRequestsCount,
      expenses,
      comments,
      summary,
      photos,
      videos,
    } = parsed.data;

    // Fetch the event
    const event = await prisma.event.findUnique({
      where: { id: params.id, isDeleted: false },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Create or Update Event Report
    const report = await prisma.eventReport.upsert({
      where: { eventId: event.id },
      update: {
        title: `Post-Event Report: ${event.title}`,
        description: summary,
        attendanceCount,
        offeringAmount,
        visitorsCount,
        newMembersCount,
        prayerRequestsCount,
        expenses,
        comments,
        summary,
        photos,
        videos,
        reportDate: event.date,
        status: "APPROVED", // Auto-approved since created by Admin/Event Manager
      },
      create: {
        eventId: event.id,
        branchId: event.branchId || "", // Link to event branch
        title: `Post-Event Report: ${event.title}`,
        description: summary,
        attendanceCount,
        offeringAmount,
        visitorsCount,
        newMembersCount,
        prayerRequestsCount,
        expenses,
        comments,
        summary,
        photos,
        videos,
        reportDate: event.date,
        status: "APPROVED",
        createdById: auth.uid,
      },
    });

    // Automatically mark the Event as COMPLETED
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { status: "COMPLETED" },
    });

    // Broadcast status change
    await triggerSocketBroadcast("event.completed", {
      id: updatedEvent.id,
      title: updatedEvent.title,
      slug: updatedEvent.slug,
      status: updatedEvent.status,
    });

    // Log Audit Log
    await logAuditEvent(
      auth.uid,
      "EVENT_REPORT_SUBMIT",
      `Submitted post-event report for "${event.title}" (${event.id}) and completed the event.`
    );

    return NextResponse.json({ success: true, report, event: updatedEvent });
  } catch (err: any) {
    console.error("[API/EVENTS/REPORT] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit post-event report." },
      { status: 500 }
    );
  }
}
