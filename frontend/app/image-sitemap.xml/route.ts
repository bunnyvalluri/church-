import { NextResponse } from "next/server";
import { CURATED_GALLERY_ITEMS } from "@/lib/galleryData";

// Static/ISR 24h edge caching (do not mix with force-dynamic so Vercel CDN caches as HIT)
export const revalidate = 86400;

const BASE_URL = "https://kcmchurch.vercel.app";

interface SitemapImageEntry {
  url: string;
  title: string;
  caption: string;
  geo?: string;
}

const CORE_IMAGE_GROUPS: Array<{ page: string; images: SitemapImageEntry[] }> = [
  {
    page: `${BASE_URL}/`,
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        title: "Kcm church Official Logo & Seal",
        caption: "Official Seal of Kingdom of Christ Ministries Hyderabad",
        geo: "Hyderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/pastor.png`,
        title: "Bishop Kurra Kristhu Raju - Senior Pastor and Founder",
        caption: "Senior Pastor Bishop Kurra Kristhu Raju - Kcm church",
        geo: "Hyderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/dove-flying.png`,
        title: "Kingdom of Christ Ministries Holy Spirit Dove Emblem",
        caption: "Faith and Worship at Kingdom of Christ Ministries",
        geo: "Hyderabad, Telangana, India",
      },
    ],
  },
  {
    page: `${BASE_URL}/about/leadership`,
    images: [
      {
        url: `${BASE_URL}/pastor.png`,
        title: "Bishop Kurra Kristhu Raju - Founder and Senior Pastor",
        caption: "Bishop Kurra Kristhu Raju leading Kingdom of Christ Ministries",
        geo: "Hyderabad, Telangana, India",
      },
    ],
  },
  {
    page: `${BASE_URL}/events`,
    images: [
      {
        url: `${BASE_URL}/images/events/family-blessing-poster-1.jpg`,
        title: "Kcm church - Family Blessing Prayer Gathering Poster",
        caption: "Kcm church Subhash Nagar Branch Revival Festival",
        geo: "Hyderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/images/events/family-blessing-poster-2.jpg`,
        title: "Kcm church - Special Prayer Gathering Poster",
        caption: "Kcm church Special Intercession & Family Blessing",
        geo: "Hyderabad, Telangana, India",
      },
    ],
  },
  {
    page: `${BASE_URL}/ngo`,
    images: [
      {
        url: `${BASE_URL}/kcm_society_ngo.jpg`,
        title: "Kingdom of Christ Ministries Society NGO Community Work",
        caption: "KCM Society Humanitarian Outreach and Food Relief",
        geo: "Hyderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/gandhi_hospital_support_image.png`,
        title: "Gandhi Hospital Medical Aid and Food Distribution",
        caption: "Daily food packets and essential patient support at Gandhi Hospital",
        geo: "Secunderabad, Telangana, India",
      },
    ],
  },
  {
    page: `${BASE_URL}/ngo/projects`,
    images: [
      {
        url: `${BASE_URL}/bethany_ashramam_care_image.png`,
        title: "Bethany Samrakshana Ashramam Elderly Care Mission",
        caption: "Providing food, medicine, and support at Bethany Ashramam",
        geo: "Hyderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/gandhi_hospital_support_image.png`,
        title: "Gandhi Hospital Medical Aid and Food Distribution",
        caption: "Daily food packets and essential patient support at Gandhi Hospital",
        geo: "Secunderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/home_for_disabled_rehab_care.png`,
        title: "Home for the Disabled Rehabilitation Care Drive",
        caption: "Mobility aids, groceries, and emotional care for differently-abled citizens",
        geo: "Jeedimetla, Hyderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/home_for_disabled_secunderabad.jpg`,
        title: "Home for the Disabled Secunderabad Outreach",
        caption: "Blankets, groceries, and care at Home for the Disabled Secunderabad",
        geo: "Secunderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/missionaries_of_charity_bhoiguda_outreach.png`,
        title: "Missionaries of Charity Bhoiguda Outreach",
        caption: "Humanitarian service alongside Missionaries of Charity in Secunderabad",
        geo: "Bhoiguda, Secunderabad, Telangana, India",
      },
      {
        url: `${BASE_URL}/sneha_charitable_trust_icu_beds.jpg`,
        title: "Sneha Charitable Trust ICU Beds & Inverter Support",
        caption: "Donating 2 ICU beds and power backup system at Sneha Charitable Trust",
        geo: "Yalampet, Medchal, Telangana, India",
      },
    ],
  },
];

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsUrl(rawUrl: string): string {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  const clean = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${BASE_URL}${encodeURI(clean)}`;
}

export async function GET() {
  const galleryEntries: SitemapImageEntry[] = [];
  const seenGalleryUrls = new Set<string>();

  for (const item of CURATED_GALLERY_ITEMS) {
    if (item.type !== "image" || !item.url) continue;
    const absUrl = toAbsUrl(item.url);
    if (seenGalleryUrls.has(absUrl)) continue;
    seenGalleryUrls.add(absUrl);

    galleryEntries.push({
      url: absUrl,
      title: `Kcm church - ${item.title}`,
      caption: `Kcm church ${item.branchName || "Hyderabad"} — ${item.description || item.title}`,
      geo: `${item.branchName ? item.branchName + ", " : ""}Hyderabad, Telangana, India`,
    });

    // Keep sitemap lean & Google-recommended (<= 1,000 images per URL node)
    if (galleryEntries.length >= 250) break;
  }

  const allGroups = [
    ...CORE_IMAGE_GROUPS,
    { page: `${BASE_URL}/gallery`, images: galleryEntries },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const group of allGroups) {
    const seenInGroup = new Set<string>();
    xml += `  <url>\n    <loc>${escapeXml(group.page)}</loc>\n`;
    for (const img of group.images) {
      if (seenInGroup.has(img.url)) continue;
      seenInGroup.add(img.url);
      xml += `    <image:image>\n      <image:loc>${escapeXml(img.url)}</image:loc>\n      <image:title>${escapeXml(img.title)}</image:title>\n      <image:caption>${escapeXml(img.caption)}</image:caption>${img.geo ? `\n      <image:geo_location>${escapeXml(img.geo)}</image:geo_location>` : ""}\n    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
