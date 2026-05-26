import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { isRateLimited, rateLimitHeaders } from "@/lib/rateLimit";
import { ok, err, getClientIp, safeJson } from "@/lib/apiResponse";
import sanitizeHtml from "sanitize-html";

// ── Validation Schema ────────────────────────────────────────────────────────
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim()
    .regex(/^[\p{L}\s'\-\.]+$/u, "Name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(254, "Email is too long"), // RFC 5321 max
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
    .max(5000, "Message is too long") // increased from 2000
    .trim(),
});

// ── Sanitizer config ─────────────────────────────────────────────────────────
const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],        // strip ALL HTML
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });

// ── Rate limit: 5 submissions per minute per IP ──────────────────────────────
const RL_OPTS = { windowMs: 60_000, maxRequests: 5 };

// ── POST /api/contact ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, RL_OPTS);

  // 1. Rate limiting
  if (isRateLimited(ip, RL_OPTS)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { ...rlHeaders, "Retry-After": "60" } }
    );
  }

  // 2. Parse body
  const body = await safeJson<unknown>(req);
  if (!body) return err("Invalid or missing JSON body", 400);

  // 3. Validate
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return err("Validation failed", 422, details);
  }

  const { name, email, phone, subject, message } = parsed.data;

  // 4. Sanitise all string inputs
  const safeData = {
    name:    sanitize(name),
    email,                          // email is safe as validated by Zod
    phone:   phone ? sanitize(phone) : null,
    subject: sanitize(subject),
    message: sanitize(message),
  };

  // 5. Persist to database with timeout guard
  try {
    const record = await Promise.race([
      prisma.contactMessage.create({ data: safeData }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), 8_000)
      ),
    ]);

    console.log(`[CONTACT] ✅ Message #${record.id} from ${safeData.name} <${email}>`);

    return ok(
      { message: "Your message has been received. We will get back to you soon!" },
      201
    );
  } catch (dbError: unknown) {
    const msg = dbError instanceof Error ? dbError.message : String(dbError);
    console.warn(`[CONTACT] Database unavailable (Prisma/DB offline). Using local file fallback. Details:`, msg);

    try {
      const fs = require('fs');
      const path = require('path');
      const fallbackDir = path.join(process.cwd(), 'prisma');
      const fallbackFile = path.join(fallbackDir, 'fallback_messages.json');
      
      let messages = [];
      if (fs.existsSync(fallbackFile)) {
        try {
          messages = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        } catch {}
      }
      
      const newMsg = {
        id: `fallback-${Date.now()}`,
        ...safeData,
        createdAt: new Date().toISOString(),
      };
      messages.push(newMsg);
      
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      fs.writeFileSync(fallbackFile, JSON.stringify(messages, null, 2), 'utf-8');
      console.info(`[CONTACT/FALLBACK] ✅ Saved message #${newMsg.id} locally in prisma/fallback_messages.json`);
      
      return ok(
        { 
          message: "Your message has been received. We will get back to you soon!",
          note: "Saved locally (DB connection offline)" 
        },
        201
      );
    } catch (fsErr) {
      console.error(`[CONTACT] ❌ Local fallback also failed:`, fsErr);
      return err(
        "We are temporarily unable to process your request. Please try again later.",
        500
      );
    }
  }
}

// ── GET /api/contact — health check ─────────────────────────────────────────
export async function GET() {
  return ok({ status: "ok", endpoint: "Contact API" });
}
