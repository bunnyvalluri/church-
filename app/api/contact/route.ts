import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Attempt to save to database
    try {
      await prisma.contactMessage.create({
        data: {
          name,
          email,
          phone,
          subject,
          message,
        },
      });
      console.log(`[CONTACT FORM] Message saved to database from ${name}`);
    } catch (dbError) {
      // If the database is not configured locally, we still want to log the message
      // so the church can see it in the server logs, and not fail the user's request.
      console.error("[CONTACT FORM] Database not configured, falling back to server log:");
      console.log(`--- NEW MESSAGE FROM: ${name} (${email}) ---`);
      console.log(`Subject: ${subject}`);
      console.log(`Phone: ${phone || "N/A"}`);
      console.log(`Message: ${message}`);
      console.log(`-------------------------------------------`);
    }

    // In a production environment, you would also add email sending logic here
    // e.g. using Resend, SendGrid, or Nodemailer

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CONTACT FORM] Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
