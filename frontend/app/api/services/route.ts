import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { safeTriggerCompanionEvent } from "@/lib/socketTrigger";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ── Validation Schema ────────────────────────────────────────────────────────────
const CreateServiceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  shortDescription: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  serviceType: z.string().default("WORSHIP"),
  icon: z.string().default("Heart"),
  iconColor: z.string().default("#ffffff"),
  cardColor: z.string().default("from-violet-500 to-purple-600"),
  badgeColor: z.string().default("from-violet-500 to-purple-600"),
  imageUrl: z.string().optional().or(z.literal("")),
  imagePublicId: z.string().optional().or(z.literal("")),
  branchId: z.string().optional().nullable(),
  speakerName: z.string().optional().or(z.literal("")),
  serviceDay: z.string().optional().or(z.literal("")),
  frequency: z.enum(["WEEKLY", "MONTHLY", "DAILY", "SPECIAL"]).default("WEEKLY"),
  occurrence: z.string().optional().or(z.literal("")),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal("")),
  timezone: z.string().default("Asia/Kolkata"),
  location: z.string().optional().or(z.literal("")),
  googleMapsUrl: z.string().optional().or(z.literal("")),
  capacity: z.number().int().positive().optional().nullable(),
  registrationEnabled: z.boolean().default(false),
  registrationLimit: z.number().int().positive().optional().nullable(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(255).optional().or(z.literal("")),
  seoDescription: z.string().max(500).optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  language: z.string().default("en"),
});

// ── Slug generator ────────────────────────────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await (prisma as any).churchService.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

// ── GET /api/services ─────────────────────────────────────────────────────────────
// Public — for landing page; Admin query with ?admin=1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status   = searchParams.get("status") || "PUBLISHED";
    const branchId = searchParams.get("branchId") || undefined;
    const featured = searchParams.get("featured");
    const search   = searchParams.get("search") || "";
    const admin    = searchParams.get("admin") === "1";
    const limit    = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
    const offset   = parseInt(searchParams.get("offset") || "0");

    const where: any = { isDeleted: false };

    if (!admin) {
      // Public — only published, not archived
      where.status = "PUBLISHED";
    } else if (status !== "ALL") {
      where.status = status;
    }

    if (branchId) where.branchId = branchId;
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { serviceDay: { contains: search, mode: "insensitive" } },
        { speakerName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [services, total] = await Promise.all([
      (prisma as any).churchService.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
        include: {
          branch: { select: { id: true, name: true } },
        },
      }),
      (prisma as any).churchService.count({ where }),
    ]);

    return NextResponse.json({ success: true, services, total });
  } catch (err: any) {
    console.error("[API/SERVICES/GET]", err);
    return NextResponse.json({ error: err.message || "Failed to load services." }, { status: 500 });
  }
}

// ── POST /api/services ────────────────────────────────────────────────────────────
// Create service — requires EVENT_MANAGER, ADMIN, or SUPER_ADMIN
export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = CreateServiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const baseSlug = generateSlug(data.title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Ensure user exists
    const existingUser = await prisma.user.findUnique({ where: { id: auth.uid } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: auth.uid,
          name: auth.name || "Event Manager",
          email: auth.email || "em@kcm.local",
          password: "dev_bypass",
          role: (auth.role as any) || "EVENT_MANAGER",
        },
      });
    }

    const service = await (prisma as any).churchService.create({
      data: {
        ...data,
        slug,
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId || null,
        branchId: data.branchId || null,
        speakerName: data.speakerName || null,
        serviceDay: data.serviceDay || null,
        occurrence: data.occurrence || null,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        location: data.location || null,
        googleMapsUrl: data.googleMapsUrl || null,
        capacity: data.capacity || null,
        registrationLimit: data.registrationLimit || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        createdById: auth.uid,
        updatedById: auth.uid,
      },
      include: { branch: { select: { id: true, name: true } } },
    });

    // Socket.IO — real-time landing page update
    await safeTriggerCompanionEvent("service.created", {
      id: service.id,
      title: service.title,
      status: service.status,
    });

    // Audit log
    try {
      await (prisma as any).auditLog.create({
        data: {
          userId: auth.uid,
          action: "SERVICE_CREATED",
          details: `Created church service "${service.title}" (${service.id})`,
        },
      });
    } catch { /* audit log is non-critical */ }

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (err: any) {
    console.error("[API/SERVICES/POST]", err);
    return NextResponse.json({ error: err.message || "Failed to create service." }, { status: 500 });
  }
}
