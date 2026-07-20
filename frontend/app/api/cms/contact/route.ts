/**
 * app/api/cms/contact/route.ts
 * CMS API for Site Contact (branch addresses, phones, maps).
 * GET  — Public, ISR-cached (60s)
 * PUT  — Update a branch (Admin+)
 * POST — Create new branch contact (Admin+)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";
import { SiteContactUpdateSchema } from "@/lib/schemas/cms";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// GET /api/cms/contact — fetch all active branch contacts
export async function GET() {
  try {
    const contacts = await (prisma as any).siteContact.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(
      { data: contacts },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/CMS/CONTACT] GET error:", err);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

// POST /api/cms/contact — create a new branch contact
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = SiteContactUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const contact = await (prisma as any).siteContact.create({
      data: parsed.data,
    });

    try { revalidateTag("cms-contact"); } catch {}

    return NextResponse.json({ data: contact, message: "Contact created." }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A contact with that branch key already exists." }, { status: 409 });
    }
    console.error("[API/CMS/CONTACT] POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to create contact." }, { status: 500 });
  }
}

// PUT /api/cms/contact?key= — update a branch contact by branchKey
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  try {
    const body = await req.json();
    const parsed = SiteContactUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const contact = key
      ? await (prisma as any).siteContact.update({
          where: { branchKey: key },
          data: parsed.data,
        })
      : await (prisma as any).siteContact.upsert({
          where: { branchKey: parsed.data.branchKey },
          update: parsed.data,
          create: parsed.data,
        });

    try { revalidateTag("cms-contact"); } catch {}

    return NextResponse.json({ data: contact, message: "Contact updated." });
  } catch (err: any) {
    console.error("[API/CMS/CONTACT] PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed to update contact." }, { status: 500 });
  }
}

// DELETE /api/cms/contact?key= — delete a branch contact
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Branch key is required." }, { status: 400 });
  }

  try {
    await (prisma as any).siteContact.delete({ where: { branchKey: key } });
    try { revalidateTag("cms-contact"); } catch {}
    return NextResponse.json({ message: "Branch contact deleted." });
  } catch (err: any) {
    console.error("[API/CMS/CONTACT] DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete contact." }, { status: 500 });
  }
}
