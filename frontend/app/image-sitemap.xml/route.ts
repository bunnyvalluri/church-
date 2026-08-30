import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // Cache 24 hours

export async function GET() {
  const sitemapPath = path.join(process.cwd(), "public", "image-sitemap.xml");

  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, "utf8");
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  }

  // Fallback XML if static file is not found
  const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://kcmchurch.vercel.app/</loc>
    <image:image>
      <image:loc>https://kcmchurch.vercel.app/logo.png</image:loc>
      <image:title>Kingdom of Christ Ministries Logo</image:title>
    </image:image>
    <image:image>
      <image:loc>https://kcmchurch.vercel.app/pastor.png</image:loc>
      <image:title>Bishop Kurra Kristhu Raju</image:title>
    </image:image>
  </url>
  <url>
    <loc>https://kcmchurch.vercel.app/ngo</loc>
    <image:image>
      <image:loc>https://kcmchurch.vercel.app/kcm_society_ngo.jpg</image:loc>
      <image:title>KCM Society NGO</image:title>
    </image:image>
  </url>
</urlset>`;

  return new NextResponse(fallbackXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
