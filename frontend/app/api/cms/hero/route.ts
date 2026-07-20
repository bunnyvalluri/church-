/**
 * app/api/cms/hero/route.ts
 * CMS API for Homepage Hero content.
 * GET  — Public, ISR-cached (60s)
 * PUT  — Admin only
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";
import { HeroUpdateSchema } from "@/lib/schemas/cms";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// Default hero fallback (matches current hardcoded values)
const HERO_DEFAULTS = {
  id: "hero",
  headline: "Welcome to Kingdom of Christ",
  subheadline: "Ministries",
  subtitle: "A place of Love, Faith, and Miracles — where every soul finds hope, purpose, and community.",
  badgeText: "We are here for you 24/7",
  ctaPrimaryText: "Join Worship",
  ctaPrimaryHref: "#services",
  ctaSecondaryText: "Watch Sermons",
  ctaSecondaryHref: "#sermons",
  ctaTertiaryText: "Prayer Request",
  ctaTertiaryHref: "/prayer",
  backgroundImageUrl: null,
  backgroundImageId: null,
  backgroundVideoUrl: null,
  backgroundType: "gradient" as const,
  isActive: true,
  updatedById: null,
  updatedAt: new Date().toISOString(),
};

// GET /api/cms/hero — fetch hero content (with fallback)
export async function GET() {
  try {
    const hero = await (prisma as any).homepageHero.findUnique({
      where: { id: "hero" },
    });

    return NextResponse.json(
      { data: hero || HERO_DEFAULTS },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/CMS/HERO] GET error:", err);
    // Always return a fallback so the frontend never breaks
    return NextResponse.json({ data: HERO_DEFAULTS }, { status: 200 });
  }
}

// PUT /api/cms/hero — update hero content (Admin+ only)
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = HeroUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const hero = await (prisma as any).homepageHero.upsert({
      where: { id: "hero" },
      update: { ...parsed.data, updatedById: auth.uid },
      create: { id: "hero", ...parsed.data, updatedById: auth.uid },
    });

    // Invalidate ISR cache
    try {
      revalidateTag("cms-hero");
    } catch {}

    return NextResponse.json({ data: hero, message: "Hero content updated successfully." });
  } catch (err: any) {
    console.error("[API/CMS/HERO] PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed to update hero." }, { status: 500 });
  }
}
