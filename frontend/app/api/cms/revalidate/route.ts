/**
 * app/api/cms/revalidate/route.ts
 * On-demand ISR revalidation endpoint.
 * Called by Admin panels after saving content to immediately refresh cached pages.
 */
import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

const VALID_TAGS = [
  "cms-hero",
  "cms-statistics",
  "cms-contact",
  "cms-footer",
  "cms-navigation",
  "cms-about",
  "cms-all",
];

// POST /api/cms/revalidate
// Body: { tags: string[] }
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const tags: string[] = Array.isArray(body.tags) ? body.tags : [];

    if (tags.length === 0 || tags.includes("cms-all")) {
      // Revalidate all CMS cache tags
      VALID_TAGS.forEach((tag) => {
        try { revalidateTag(tag); } catch {}
      });
      try { revalidatePath("/"); } catch {}

      return NextResponse.json({
        revalidated: true,
        tags: VALID_TAGS,
        message: "All CMS cache tags revalidated.",
      });
    }

    const revalidated: string[] = [];
    for (const tag of tags) {
      if (VALID_TAGS.includes(tag)) {
        try {
          revalidateTag(tag);
          revalidated.push(tag);
        } catch {}
      }
    }

    // Also revalidate homepage path
    try { revalidatePath("/"); } catch {}

    return NextResponse.json({
      revalidated: true,
      tags: revalidated,
      message: `Revalidated ${revalidated.length} cache tag(s).`,
    });
  } catch (err: any) {
    console.error("[API/CMS/REVALIDATE] error:", err);
    return NextResponse.json({ error: err.message || "Failed to revalidate." }, { status: 500 });
  }
}
