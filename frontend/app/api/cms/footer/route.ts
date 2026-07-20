/**
 * app/api/cms/footer/route.ts
 * CMS API for Footer configuration.
 * GET — Public, ISR-cached (60s)
 * PUT — Admin only
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";
import { FooterConfigUpdateSchema } from "@/lib/schemas/cms";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const FOOTER_DEFAULTS = {
  id: "footer",
  tagline: '"Time is fulfilled, and the Kingdom of God is at hand; repent and believe in the Gospel." — Mark 1:15',
  taglineTe: 'కాలము సంభవమైయున్నది, దేవునిరాజ్యము సమీపించియున్నది, మారుమనస్సు పొంది సువార్త నమ్ముడి. — మార్కు 1:15',
  address: "Kingdom of Christ Ministries, 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad – 500055",
  mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
  phones: [
    { label: "Senior Pastor", number: "+91 97040 90069" },
    { label: "Office", number: "+91 96409 43777" },
    { label: "Office", number: "+91 73964 33856" },
  ],
  email: "kingofchristministries23@gmail.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO",
  facebookUrl: null,
  twitterUrl: null,
  copyright: null,
  updatedById: null,
  updatedAt: new Date().toISOString(),
};

// GET /api/cms/footer
export async function GET() {
  try {
    const footer = await (prisma as any).footerConfig.findUnique({
      where: { id: "footer" },
    });

    return NextResponse.json(
      { data: footer || FOOTER_DEFAULTS },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/CMS/FOOTER] GET error:", err);
    return NextResponse.json({ data: FOOTER_DEFAULTS }, { status: 200 });
  }
}

// PUT /api/cms/footer
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = FooterConfigUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const footer = await (prisma as any).footerConfig.upsert({
      where: { id: "footer" },
      update: { ...parsed.data, updatedById: auth.uid },
      create: { id: "footer", ...parsed.data, updatedById: auth.uid },
    });

    try { revalidateTag("cms-footer"); } catch {}

    return NextResponse.json({ data: footer, message: "Footer updated successfully." });
  } catch (err: any) {
    console.error("[API/CMS/FOOTER] PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed to update footer." }, { status: 500 });
  }
}
