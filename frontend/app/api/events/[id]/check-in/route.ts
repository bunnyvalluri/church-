import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { ticketCode } = body; // Format: "KCM-TICKET-{registrationId}" or raw registration ID

    if (!ticketCode) {
      return NextResponse.json({ error: "Missing ticketCode parameter." }, { status: 400 });
    }

    // Extract registration ID
    let registrationId = ticketCode;
    if (ticketCode.startsWith("KCM-TICKET-")) {
      registrationId = ticketCode.replace("KCM-TICKET-", "");
    }

    // Fetch the registration
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Invalid ticket: Registration not found." }, { status: 404 });
    }

    if (registration.eventId !== params.id) {
      return NextResponse.json(
        { error: `Invalid ticket: This registration is for event "${registration.event.title}", not this event.` },
        { status: 400 }
      );
    }

    if (registration.status !== "REGISTERED") {
      return NextResponse.json(
        { error: `Invalid ticket: Registration status is "${registration.status}". Cannot check-in.` },
        { status: 400 }
      );
    }

    // Check if already checked-in
    const existingAttendance = await prisma.eventAttendance.findFirst({
      where: { registrationId: registration.id },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: "Already checked in.",
          alreadyAttended: true,
          attendance: existingAttendance,
          registration,
        },
        { status: 400 }
      );
    }

    // Log the attendance
    const attendance = await prisma.eventAttendance.create({
      data: {
        eventId: registration.eventId,
        registrationId: registration.id,
        memberId: registration.userId,
        name: registration.name,
        email: registration.email,
        checkedInBy: auth.uid,
      },
    });

    // Broadcast Socket.IO update (optional, e.g. for real-time check-in counters)
    await triggerSocketBroadcast("event.attendance.checkin", {
      eventId: registration.eventId,
      registrationId: registration.id,
      name: registration.name,
      checkedInAt: attendance.attendedAt,
    });

    // Log Audit Log
    await logAuditEvent(
      auth.uid,
      "EVENT_CHECKIN",
      `Checked in attendee "${registration.name}" for event "${registration.event.title}" (${registration.eventId}) via QR.`
    );

    return NextResponse.json({
      success: true,
      message: `Checked in: ${registration.name}`,
      registration,
      attendance,
    });
  } catch (err: any) {
    console.error("[API/EVENTS/CHECK-IN] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process check-in." },
      { status: 500 }
    );
  }
}
