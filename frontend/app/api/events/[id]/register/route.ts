import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/authMiddleware";
import { z } from "zod";
import QRCode from "qrcode";
import { triggerSocketBroadcast, sendEmailNotification, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

const RegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = RegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { name, email, phone } = parsed.data;

    // Check if user is logged in
    const auth = await getAuthenticatedUser(req);
    const userId = auth ? auth.uid : null;

    // Fetch the event
    const event = await prisma.event.findUnique({
      where: { id: params.id, isDeleted: false },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Registration is not open for this event." }, { status: 400 });
    }

    // Check dates
    const now = new Date();
    if (event.registrationOpenDate && now < new Date(event.registrationOpenDate)) {
      return NextResponse.json({ error: "Registration is not open yet." }, { status: 400 });
    }
    if (event.registrationCloseDate && now > new Date(event.registrationCloseDate)) {
      return NextResponse.json({ error: "Registration has closed." }, { status: 400 });
    }

    // Check if already registered
    if (userId) {
      const existing = await prisma.eventRegistration.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: event.id,
          },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "You are already registered for this event.", registration: existing },
          { status: 400 }
        );
      }
    }

    // Determine status (Registered vs Waitlisted)
    let registrationStatus = "REGISTERED";
    let isWaitlisted = false;

    if (event.registrationRequired && event.registrationLimit !== null) {
      const currentRegCount = await prisma.eventRegistration.count({
        where: { eventId: event.id, status: "REGISTERED" },
      });

      if (currentRegCount >= event.registrationLimit) {
        registrationStatus = "WAITLISTED";
        isWaitlisted = true;
      }
    }

    // Create the registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId,
        eventId: event.id,
        name,
        email,
        phone,
        status: registrationStatus,
      },
    });

    // Generate ticket QR Code base64 data URL
    const qrData = `KCM-TICKET-${registration.id}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Update remaining seats and save QR code
    const finalRegistration = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { qrCode: qrCodeUrl },
    });

    if (registrationStatus === "REGISTERED" && event.remainingSeats !== null) {
      await prisma.event.update({
        where: { id: event.id },
        data: {
          remainingSeats: {
            decrement: 1,
          },
        },
      });
    }

    // Send confirmation email
    const subject = isWaitlisted
      ? `Waitlisted: KCM Event - ${event.title}`
      : `Ticket Confirmed: KCM Event - ${event.title}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fafafa;">
        <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Kingdom of Christ Ministries</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your Event Ticket</p>
        </div>
        
        <p>Dear <strong>${name}</strong>,</p>
        <p>${
          isWaitlisted
            ? `You have been added to the waitlist for <strong>${event.title}</strong>. We will notify you if a seat opens up!`
            : `Your registration is confirmed! Below is your event entry ticket.`
        }</p>

        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 18px;">${event.title}</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>Location:</strong> ${event.location}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>Date & Time:</strong> ${new Date(event.date).toLocaleDateString("en-IN")} at ${event.time}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>Ticket Status:</strong> <span style="color: ${isWaitlisted ? '#f59e0b' : '#10b981'}; font-weight: bold;">${registrationStatus}</span></p>

          ${
            !isWaitlisted
              ? `<div style="margin-top: 20px;">
                  <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 180px; height: 180px;" />
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">Present this QR code at the entrance for check-in</p>
                 </div>`
              : ""
          }
        </div>
        
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
          If you have any questions, contact Brother John at info@kcm.org or call +91 98765 43210.
        </p>
      </div>
    `;

    await sendEmailNotification(email, subject, emailHtml);

    // Broadcast Socket.IO event
    await triggerSocketBroadcast("event.registration.created", {
      eventId: event.id,
      registrationId: finalRegistration.id,
      name,
      status: registrationStatus,
    });

    // Log Audit Log
    await logAuditEvent(
      userId,
      "EVENT_REGISTER",
      `Registered user/guest "${name}" for event "${event.title}" (${event.id}) in state ${registrationStatus}.`
    );

    return NextResponse.json({
      success: true,
      registration: finalRegistration,
      isWaitlisted,
    });
  } catch (err: any) {
    console.error("[API/EVENTS/REGISTER] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register for event." },
      { status: 500 }
    );
  }
}
