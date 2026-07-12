import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { safeTriggerCompanionEvent } from "@/lib/socketTrigger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ReorderSchema = z.object({
  // Array of { id, displayOrder } objects
  items: z.array(z.object({
    id: z.string(),
    displayOrder: z.number().int(),
  })).min(1),
});

// ── POST /api/services/reorder ───────────────────────────────────────────────────
// Reorder services — batch update displayOrder values
export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = ReorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    // Batch update in a transaction for atomicity
    await prisma.$transaction(
      parsed.data.items.map((item) =>
        (prisma as any).churchService.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder, updatedById: auth.uid },
        })
      )
    );

    await safeTriggerCompanionEvent("service.reordered", {
      updatedBy: auth.name || auth.email,
      count: parsed.data.items.length,
    });

    return NextResponse.json({ success: true, message: `Reordered ${parsed.data.items.length} services.` });
  } catch (err: any) {
    console.error("[API/SERVICES/REORDER]", err);
    return NextResponse.json({ error: err.message || "Failed to reorder services." }, { status: 500 });
  }
}
