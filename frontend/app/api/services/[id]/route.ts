import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { safeTriggerCompanionEvent } from "@/lib/socketTrigger";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateServiceSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  shortDescription: z.string().max(300).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  serviceType: z.string().optional(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  cardColor: z.string().optional(),
  badgeColor: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  speakerName: z.string().optional().nullable(),
  serviceDay: z.string().optional().nullable(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "DAILY", "SPECIAL"]).optional(),
  occurrence: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  timezone: z.string().optional(),
  location: z.string().optional().nullable(),
  googleMapsUrl: z.string().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  registrationEnabled: z.boolean().optional(),
  registrationLimit: z.number().int().positive().optional().nullable(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
});

// ── GET /api/services/[id] ────────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await (prisma as any).churchService.findUnique({
      where: { id: params.id },
      include: { branch: { select: { id: true, name: true } } },
    });

    if (!service || service.isDeleted) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    console.error("[API/SERVICES/[id]/GET]", err);
    return NextResponse.json({ error: err.message || "Failed to load service." }, { status: 500 });
  }
}

// ── PUT /api/services/[id] ────────────────────────────────────────────────────────
// Full update — requires EVENT_MANAGER+
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = UpdateServiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await (prisma as any).churchService.findUnique({
      where: { id: params.id },
    });
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    // If image is replaced and old one was Cloudinary — delete old
    if (
      parsed.data.imagePublicId !== undefined &&
      parsed.data.imagePublicId !== existing.imagePublicId &&
      existing.imagePublicId
    ) {
      try {
        await deleteCloudinaryAsset(existing.imagePublicId, "image");
      } catch { /* non-critical */ }
    }

    const service = await (prisma as any).churchService.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        updatedById: auth.uid,
      },
      include: { branch: { select: { id: true, name: true } } },
    });

    // Real-time update
    await safeTriggerCompanionEvent("service.updated", {
      id: service.id,
      title: service.title,
      status: service.status,
    });

    try {
      await (prisma as any).auditLog.create({
        data: {
          userId: auth.uid,
          action: "SERVICE_UPDATED",
          details: `Updated church service "${service.title}" (${service.id})`,
        },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    console.error("[API/SERVICES/[id]/PUT]", err);
    return NextResponse.json({ error: err.message || "Failed to update service." }, { status: 500 });
  }
}

// ── PATCH /api/services/[id] ─────────────────────────────────────────────────────
// Partial update: status, featured, displayOrder, soft-delete, restore, duplicate
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { action, ...rest } = body;

    const existing = await (prisma as any).churchService.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    let updateData: any = { updatedById: auth.uid };
    let socketEvent = "service.updated";

    switch (action) {
      case "publish":
        updateData.status = "PUBLISHED";
        break;
      case "draft":
        updateData.status = "DRAFT";
        break;
      case "archive":
        updateData.status = "ARCHIVED";
        socketEvent = "service.archived";
        break;
      case "restore":
        updateData.isDeleted = false;
        updateData.deletedAt = null;
        updateData.status = "DRAFT";
        socketEvent = "service.restored";
        break;
      case "toggle-featured":
        updateData.featured = !existing.featured;
        break;
      case "toggle-enabled":
        updateData.status = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        break;
      case "duplicate": {
        // Create a copy with new slug
        const { id, slug, createdAt, updatedAt, ...copyData } = existing;
        const newSlug = `${existing.slug}-copy-${Date.now()}`.slice(0, 80);
        const duplicate = await (prisma as any).churchService.create({
          data: {
            ...copyData,
            slug: newSlug,
            title: `${existing.title} (Copy)`,
            status: "DRAFT",
            featured: false,
            displayOrder: existing.displayOrder + 1,
            createdById: auth.uid,
            updatedById: auth.uid,
          },
          include: { branch: { select: { id: true, name: true } } },
        });
        return NextResponse.json({ success: true, service: duplicate, action: "duplicated" });
      }
      default:
        // Generic partial update
        Object.assign(updateData, rest);
    }

    const service = await (prisma as any).churchService.update({
      where: { id: params.id },
      data: updateData,
      include: { branch: { select: { id: true, name: true } } },
    });

    await safeTriggerCompanionEvent(socketEvent, { id: service.id, title: service.title, status: service.status });

    return NextResponse.json({ success: true, service, action: action || "updated" });
  } catch (err: any) {
    console.error("[API/SERVICES/[id]/PATCH]", err);
    return NextResponse.json({ error: err.message || "Failed to patch service." }, { status: 500 });
  }
}

// ── DELETE /api/services/[id] ────────────────────────────────────────────────────
// Soft delete (moves to trash, recoverable) — permanent delete with ?hard=1
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get("hard") === "1";

    const existing = await (prisma as any).churchService.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    if (hard) {
      // Hard delete — remove Cloudinary asset first
      if (existing.imagePublicId) {
        try { await deleteCloudinaryAsset(existing.imagePublicId, "image"); } catch { /* non-critical */ }
      }
      await (prisma as any).churchService.delete({ where: { id: params.id } });
    } else {
      // Soft delete
      await (prisma as any).churchService.update({
        where: { id: params.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          status: "ARCHIVED",
          updatedById: auth.uid,
        },
      });
    }

    await safeTriggerCompanionEvent("service.deleted", { id: params.id, hard });

    try {
      await (prisma as any).auditLog.create({
        data: {
          userId: auth.uid,
          action: hard ? "SERVICE_DELETED_HARD" : "SERVICE_DELETED_SOFT",
          details: `${hard ? "Permanently deleted" : "Soft-deleted"} church service "${existing.title}" (${existing.id})`,
        },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({
      success: true,
      message: hard ? "Service permanently deleted." : "Service moved to trash.",
    });
  } catch (err: any) {
    console.error("[API/SERVICES/[id]/DELETE]", err);
    return NextResponse.json({ error: err.message || "Failed to delete service." }, { status: 500 });
  }
}
