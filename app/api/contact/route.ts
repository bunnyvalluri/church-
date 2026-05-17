import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRateLimited, rateLimitHeaders } from "@/lib/rateLimit";
import { ok, err, getClientIp, safeJson } from "@/lib/apiResponse";
import sanitizeHtml from "sanitize-html";

// ── Validation Schema ────────────────────────────────────────────────────────
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  phone: z
    .string()
    .max(20, "Phone is too long")
    .regex(/^[\d\s\+\-\(\)]*$/, "Invalid phone number")
    .optional()
    .nullable(),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject is too long")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long")
    .trim(),
});

// ── Rate limit config ────────────────────────────────────────────────────────
const RL_OPTS = { windowMs: 60_000, maxRequests: 5 };

// ── POST /api/contact ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // 1. Rate limiting
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, RL_OPTS);

  if (isRateLimited(ip, RL_OPTS)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { ...rlHeaders, 'Retry-After': '60' } }
    );
  }

  // 2. Parse body safely
  const body = await safeJson<unknown>(req);
  if (!body) {
    return err("Invalid JSON body", 400);
  }

  // 3. Validate with Zod
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return err("Validation failed", 422, details);
  }

  const { name, email, phone, subject, message } = parsed.data;

  // 4. Sanitise: use sanitize-html for proper XSS prevention
  const sanitize = (s: string) => sanitizeHtml(s, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {}
  });
  
  const safeData = {
    name: sanitize(name),
    email,
    phone: phone ? sanitize(phone) : null,
    subject: sanitize(subject),
    message: sanitize(message),
  };

  // 5. Persist to database
  try {
    const record = await prisma.contactMessage.create({ data: safeData });
    console.log(`[CONTACT] Message #${record.id} saved from ${name} <${email}>`);

    return ok(
      { message: "Your message has been received. We will get back to you soon!" },
      201
    );
  } catch (dbError) {
    console.error("[CONTACT] DB write error:", dbError);
    // Fallback: still acknowledge the user but flag internally
    return err(
      "We received your request but encountered a server issue. Our team has been notified.",
      500
    );
  }
}

// ── GET /api/contact — health check ─────────────────────────────────────────
export async function GET() {
  return ok({ status: "Contact API is healthy" });
}
