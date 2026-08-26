/**
 * scripts/audit-seo.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Technical SEO & Schema.org Quality Gate for KCM Church Platform.
 * Run with: node frontend/scripts/audit-seo.ts
 */

import { PAGE_METADATA, SITE_URL, canonicalUrl } from "../lib/seo";
import { churchSchema, websiteSchema, breadcrumbSchema, sermonVideoSchema, eventSchema } from "../lib/schema";

let failures = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log("=================================================");
console.log("KCM COMPREHENSIVE TECHNICAL SEO AUTOMATED AUDIT");
console.log("=================================================");

// 1. SITE_URL Check
assert(SITE_URL === "https://kcmchurch.vercel.app", "Site URL is production HTTPS: https://kcmchurch.vercel.app");

// 2. Canonical URL Normalization
assert(canonicalUrl("/") === "https://kcmchurch.vercel.app/", "Root canonical is exact https://kcmchurch.vercel.app/");
assert(canonicalUrl("/about/story/") === "https://kcmchurch.vercel.app/about/story", "Trailing slash is removed");
assert(canonicalUrl("/SERMONS") === "https://kcmchurch.vercel.app/sermons", "Path is lowercased");

// 3. Page Metadata Audit
const titles = new Set<string>();
const descriptions = new Set<string>();
const paths = new Set<string>();

const expectedPublicKeys = [
  "home", "about", "story", "leadership", "beliefs", "ministries", "mission",
  "pastorMessage", "sermons", "events", "prayer", "smallGroups", "volunteer",
  "serve", "membership", "locations", "gallery", "ngo", "ngoProjects",
  "ngoGallery", "ngoVideos", "ngoVolunteers", "contact", "give", "privacy", "terms"
];

for (const key of expectedPublicKeys) {
  const meta = (PAGE_METADATA as any)[key];
  assert(!!meta, `Metadata preset exists for '${key}'`);
  if (!meta) continue;

  const titleStr = typeof meta.title === "string" ? meta.title : "";
  const descStr = typeof meta.description === "string" ? meta.description : "";
  const canonical = meta.alternates?.canonical || "";

  assert(titleStr.length > 10, `[${key}] Title is present and descriptive (${titleStr.length} chars)`);
  assert(!titles.has(titleStr), `[${key}] Title is globally unique`);
  titles.add(titleStr);

  assert(descStr.length >= 50, `[${key}] Description has sufficient depth (${descStr.length} chars)`);
  assert(!descriptions.has(descStr), `[${key}] Description is globally unique`);
  descriptions.add(descStr);

  assert(typeof canonical === "string" && canonical.startsWith("https://kcmchurch.vercel.app"), `[${key}] Canonical uses production HTTPS`);
  assert(!paths.has(canonical), `[${key}] Canonical path is unique`);
  paths.add(canonical);

  assert(meta.openGraph?.title === titleStr, `[${key}] OpenGraph title matches page title`);
  assert(meta.openGraph?.url === canonical, `[${key}] OpenGraph URL matches canonical`);
  assert(meta.twitter?.card === "summary_large_image", `[${key}] Twitter card is summary_large_image`);
  assert(meta.robots?.index === true, `[${key}] Public page is indexable`);
}

// 4. Private Route Audit
const privateKeys = ["login", "register", "forgotPassword"];
for (const key of privateKeys) {
  const meta = (PAGE_METADATA as any)[key];
  assert(!!meta, `Private metadata preset exists for '${key}'`);
  if (!meta) continue;
  assert(meta.robots?.index === false, `[${key}] Private page has index: false`);
  assert(meta.robots?.follow === false, `[${key}] Private page has follow: false`);
}

// 5. Schema.org JSON-LD Builders Audit
console.log("\n── Schema.org Structured Data Verification ──");
const church = churchSchema();
assert(church["@context"] === "https://schema.org", "Church schema context is https://schema.org");
assert(Array.isArray(church["@type"]) && church["@type"].includes("Church"), "Church schema type is Church");
assert(church.name === "Kingdom of Christ Ministries", "Church schema name is authentic");
assert(church.address.addressLocality === "Hyderabad", "Church schema addressLocality is Hyderabad");
assert(church.address.postalCode === "500055", "Church schema postalCode is 500055");
assert(church.geo.latitude === 17.5186 && church.geo.longitude === 78.4487, "Church schema geo coordinates are verified");

const website = websiteSchema();
assert(website["@type"] === "WebSite", "WebSite schema type is WebSite");
assert(website.name === "Kingdom of Christ Ministries", "WebSite schema name is correct");

const breadcrumbs = breadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "About", url: `${SITE_URL}/about` },
]);
assert(breadcrumbs["@type"] === "BreadcrumbList", "BreadcrumbList schema type is BreadcrumbList");
assert(breadcrumbs.itemListElement.length === 2, "BreadcrumbList contains 2 levels");
assert(breadcrumbs.itemListElement[0].position === 1, "BreadcrumbList position 1 is Home");

const video = sermonVideoSchema({
  name: "Living by Faith Sermon",
  description: "Inspiring sermon by Bishop Kurra Kristhu Raju",
  thumbnailUrl: `${SITE_URL}/pastor.png`,
  uploadDate: "2026-08-01",
  contentUrl: "https://youtube.com/watch?v=sample",
});
assert(video["@type"] === "VideoObject", "VideoObject schema type is VideoObject");

const event = eventSchema({
  name: "Sunday Worship Gathering",
  description: "Weekly Sunday morning worship at Jeedimetla",
  startDate: "2026-08-30T05:45:00+05:30",
  location: "Jeedimetla Branch, Hyderabad",
  eventUrl: `${SITE_URL}/events`,
});
assert(event["@type"] === "Event", "Event schema type is Event");

console.log("\n=================================================");
if (failures === 0) {
  console.log("🎉 ALL SEO & STRUCTURED DATA QUALITY CHECKS PASSED!");
  console.log("=================================================");
  process.exit(0);
} else {
  console.error(`💥 AUDIT FAILED with ${failures} error(s)!`);
  console.log("=================================================");
  process.exit(1);
}
