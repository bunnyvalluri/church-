/**
 * app/api/cms/about/route.ts
 * CMS API for About section content.
 * GET — Public, ISR-cached
 * PUT — Admin only
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";
import { AboutConfigUpdateSchema } from "@/lib/schemas/cms";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const ABOUT_DEFAULTS = {
  id: "about",
  sectionBadge: "Who We Are",
  heading: "About Our Ministry",
  headingTe: null,
  headingHi: null,
  subtitle: "Kingdom of Christ Ministries is a vibrant, Spirit-filled community in Hyderabad, dedicated to spreading the love of Christ through worship, fellowship, discipleship, and community service.",
  subtitleTe: null,
  subtitleHi: null,
  missionTitle: "Our Mission",
  missionText: "To preach the Gospel of the Kingdom of Christ, make disciples of all nations, and serve the community with compassion — reaching the lost, healing the broken, and empowering believers to live for God's glory.",
  values: [
    {
      icon: "Church",
      title: "Worship",
      titleTe: "ఆరాధన",
      description: "We worship God in Spirit and truth, glorifying His name through song, prayer, and dedicated praise.",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: "Heart",
      title: "Community",
      titleTe: "సమాజం",
      description: "Building a loving community where every person is welcomed, valued, and spiritually nourished.",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: "Users",
      title: "Fellowship",
      titleTe: "సహవాసం",
      description: "Growing together through small groups, shared meals, prayer circles, and heartfelt connection.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: "BookOpen",
      title: "Teaching",
      titleTe: "బోధ",
      description: "Grounding believers in God's Word through expository preaching, Bible studies, and discipleship programs.",
      gradient: "from-emerald-500 to-teal-600",
    },
  ],
  updatedById: null,
  updatedAt: new Date().toISOString(),
};

// GET /api/cms/about
export async function GET() {
  try {
    const about = await (prisma as any).aboutConfig.findUnique({
      where: { id: "about" },
    });

    return NextResponse.json(
      { data: about || ABOUT_DEFAULTS },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/CMS/ABOUT] GET error:", err);
    return NextResponse.json({ data: ABOUT_DEFAULTS }, { status: 200 });
  }
}

// PUT /api/cms/about
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = AboutConfigUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const about = await (prisma as any).aboutConfig.upsert({
      where: { id: "about" },
      update: { ...parsed.data, updatedById: auth.uid },
      create: { id: "about", ...parsed.data, updatedById: auth.uid },
    });

    try { revalidateTag("cms-about"); } catch {}

    return NextResponse.json({ data: about, message: "About section updated." });
  } catch (err: any) {
    console.error("[API/CMS/ABOUT] PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed to update about section." }, { status: 500 });
  }
}
