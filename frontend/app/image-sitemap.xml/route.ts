import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // Cache 24 hours

const BASE_URL = "https://kcmchurch.vercel.app";

// Core high-value images for Google Images indexing
const FEATURED_IMAGES = [
  {
    page: `${BASE_URL}/`,
    images: [
      { url: `${BASE_URL}/logo.png`, title: "Kingdom of Christ Ministries KCM Church Logo", caption: "Official Seal of Kingdom of Christ Ministries Hyderabad" },
      { url: `${BASE_URL}/pastor.png`, title: "Bishop Kurra Kristhu Raju - Senior Pastor & Founder", caption: "Senior Pastor Bishop Kurra Kristhu Raju - KCM Church" },
      { url: `${BASE_URL}/dove-flying.png`, title: "Kingdom of Christ Ministries Holy Spirit Dove Emblem", caption: "Faith and Worship at Kingdom of Christ Ministries" },
    ],
  },
  {
    page: `${BASE_URL}/about/leadership`,
    images: [
      { url: `${BASE_URL}/pastor.png`, title: "Bishop Kurra Kristhu Raju - Founder and Senior Pastor", caption: "Bishop Kurra Kristhu Raju leading Kingdom of Christ Ministries" },
    ],
  },
  {
    page: `${BASE_URL}/ngo`,
    images: [
      { url: `${BASE_URL}/kcm_society_ngo.jpg`, title: "Kingdom of Christ Ministries Society NGO Community Work", caption: "KCM Society Humanitarian Outreach and Food Relief" },
      { url: `${BASE_URL}/ngo_outreach_drive_thumbnail.png`, title: "KCM NGO Community Welfare Drive", caption: "Serving vulnerable families and children in Hyderabad" },
    ],
  },
  {
    page: `${BASE_URL}/ngo/projects`,
    images: [
      { url: `${BASE_URL}/bethany_ashramam_care_image.png`, title: "Bethany Samrakshana Ashramam Elderly Care Mission", caption: "Providing food, medicine, and support at Bethany Ashramam" },
      { url: `${BASE_URL}/bethany_ashramam_thumbnail.png`, title: "Bethany Ashramam Support Project", caption: "Compassionate care and fellowship for elderly residents" },
      { url: `${BASE_URL}/gandhi_hospital_support_image.png`, title: "Gandhi Hospital Medical Aid and Food Distribution", caption: "Daily food packets and essential patient support at Gandhi Hospital" },
      { url: `${BASE_URL}/home_for_disabled_rehab_care.png`, title: "Home for the Disabled Rehabilitation Care Drive", caption: "Mobility aids, groceries, and emotional care for differently-abled citizens" },
      { url: `${BASE_URL}/missionaries_of_charity_bhoiguda_outreach.png`, title: "Missionaries of Charity Bhoiguda Outreach", caption: "Humanitarian service alongside Missionaries of Charity in Secunderabad" },
    ],
  },
  {
    page: `${BASE_URL}/gallery`,
    images: [
      { url: `${BASE_URL}/logo.png`, title: "KCM Church Hyderabad Worship Gallery", caption: "Highlights from Sunday Services and Prayer Gatherings" },
      { url: `${BASE_URL}/pastor.png`, title: "Bishop Kurra Kristhu Raju Ministering", caption: "Gospel Preaching and Ministry at Kingdom of Christ Ministries" },
    ],
  },
];

export async function GET() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const group of FEATURED_IMAGES) {
    xml += `  <url>\n    <loc>${group.page}</loc>\n`;
    for (const img of group.images) {
      xml += `    <image:image>\n      <image:loc>${img.url}</image:loc>\n      <image:title>${img.title}</image:title>\n      <image:caption>${img.caption}</image:caption>\n    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
