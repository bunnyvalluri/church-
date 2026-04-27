import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Define a strict schema for the incoming payload
const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().max(20).optional().nullable(),
  subject: z.string().min(2).max(150),
  message: z.string().min(5).max(2000), // Protect against massive payloads (DoS)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Zod Validation (Strict Type Checking)
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = validationResult.data;

    // 2. Sanitization (Prevent Stored XSS)
    const cleanMessage = sanitizeHtml(message, {
      allowedTags: [], // Strip ALL HTML tags
      allowedAttributes: {}
    });

    // 3. Attempt to save to database securely
    try {
      await prisma.contactMessage.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject,
          message: cleanMessage,
        },
      });
      console.log(`[CONTACT FORM] Secure message saved from ${name}`);
    } catch (dbError) {
      console.error("[CONTACT FORM] Database not configured, falling back to server log:");
      console.log(`--- NEW MESSAGE FROM: ${name} (${email}) ---`);
      console.log(`Subject: ${subject}`);
      console.log(`Phone: ${phone || "N/A"}`);
      console.log(`Message: ${cleanMessage}`);
      console.log(`-------------------------------------------`);
    }

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
