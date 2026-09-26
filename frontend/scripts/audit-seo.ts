/**
 * scripts/audit-seo.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Technical SEO, Entity Consolidation & Schema.org Quality Gate
 * for Kingdom of Christ Ministries (KCM).
 *
 * Verifies:
 *  - Canonical Entity Graph & stable @ids
 *  - Alternate names ("KCM", "KCM Ministries", "KCM Church", etc.)
 *  - Truthful branch location structured data
 *  - Unique metadata, titles, descriptions & HTTPS canonicals across 33+ routes
 *  - Private route indexing protection (noindex, nofollow)
 *  - Schema.org JSON-LD builders: Church, WebSite, Branch, Breadcrumbs, Videos, Events
 */

import { PAGE_METADATA, SITE_URL, canonicalUrl } from "../lib/seo";
import {
  churchSchema,
  websiteSchema,
  branchLocationSchema,
  breadcrumbSchema,
  sermonVideoSchema,
  eventSchema,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from "../lib/schema";
import { KCM_BRANCHES } from "../lib/locationsData";

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
console.log("KCM COMPREHENSIVE TECHNICAL SEO & ENTITY AUDIT");
console.log("=================================================");

// 1. SITE_URL & Canonical URL Normalization
assert(SITE_URL === "https://kcmchurch.vercel.app", "Site URL is production HTTPS: https://kcmchurch.vercel.app");
assert(canonicalUrl("/") === "https://kcmchurch.vercel.app/", "Root canonical is exact https://kcmchurch.vercel.app/");
assert(canonicalUrl("/about/story/") === "https://kcmchurch.vercel.app/about/story", "Trailing slash is removed");
assert(canonicalUrl("/SERMONS") === "https://kcmchurch.vercel.app/sermons", "Path is lowercased");
assert(canonicalUrl("/locations/shapur-nagar/") === "https://kcmchurch.vercel.app/locations/shapur-nagar", "Branch canonical normalized");

// 2. Primary Organization Entity & Graph Assertions
console.log("\n── Primary Organization & WebSite Entity Verification ──");
const church = churchSchema();
assert(church["@context"] === "https://schema.org", "Organization context is https://schema.org");
assert(church["@id"] === "https://kcmchurch.vercel.app/#organization", "Stable canonical organization @id is https://kcmchurch.vercel.app/#organization");
assert(church.name === "Kingdom of Christ Ministries", "Canonical organization name is Kingdom of Christ Ministries");
assert(Array.isArray(church.alternateName), "Alternate names is an array");
assert(church.alternateName.includes("KCM"), "Alternate names includes 'KCM'");
assert(church.alternateName.includes("KCM Ministries"), "Alternate names includes 'KCM Ministries'");
assert(church.alternateName.includes("KCM Church"), "Alternate names includes 'KCM Church'");
assert(church.alternateName.includes("Kingdom of Christ Ministry"), "Alternate names includes 'Kingdom of Christ Ministry'");
assert(church.alternateName.includes("Kingdom of Christ"), "Alternate names includes 'Kingdom of Christ'");
assert(church.sameAs.includes("https://www.youtube.com/@kcmchurchshapur7107"), "sameAs includes official YouTube channel");
assert(church.telephone.includes("+91-97040-90069"), "Official phone +91-97040-90069 is declared");
assert(church.email === "kingofchristministries23@gmail.com", "Official church email is declared");

const website = websiteSchema();
assert(website["@type"] === "WebSite", "WebSite schema type is WebSite");
assert(website["@id"] === "https://kcmchurch.vercel.app/#website", "WebSite entity @id is https://kcmchurch.vercel.app/#website");
assert(website.name === "Kingdom of Christ Ministries", "WebSite name matches primary organization");
assert(website.publisher["@id"] === ORGANIZATION_ID, "WebSite publisher connects to primary organization @id");

// 3. Dedicated Branch Location Schema Verification
console.log("\n── Branch Location Entities Verification ──");
const branchKeys = Object.keys(KCM_BRANCHES);
assert(branchKeys.length === 3, "Exactly 3 verified physical branches configured");

for (const slug of branchKeys) {
  const branch = KCM_BRANCHES[slug];
  const branchSchema = branchLocationSchema(branch);
  assert(Array.isArray(branchSchema["@type"]) && branchSchema["@type"].includes("PlaceOfWorship"), `[${slug}] Schema type includes PlaceOfWorship`);
  assert(branchSchema["@id"] === `https://kcmchurch.vercel.app/locations/${branch.slug}#branch`, `[${slug}] Stable branch entity @id declared`);
  assert(branchSchema.parentOrganization["@id"] === ORGANIZATION_ID, `[${slug}] Connected to parent organization #organization`);
  assert(branchSchema.address.addressLocality === "Hyderabad", `[${slug}] Branch addressLocality is Hyderabad`);
  assert(branchSchema.address.postalCode.length === 6, `[${slug}] Branch postalCode is valid 6 digits`);
  assert(branchSchema.geo.latitude > 17 && branchSchema.geo.longitude > 78, `[${slug}] Verified geo coordinates present`);
  assert(branchSchema.openingHoursSpecification.length > 0, `[${slug}] Opening hours schedule specified`);
}

// 4. Public Page Metadata Completeness & Uniqueness Audit
console.log("\n── Public Page Metadata Audit ──");
const titles = new Set<string>();
const descriptions = new Set<string>();
const paths = new Set<string>();

const expectedPublicKeys = [
  "home", "about", "story", "leadership", "beliefs", "ministries", "mission",
  "pastorMessage", "sermons", "events", "prayer", "getInvolved", "smallGroups", "volunteer",
  "serve", "membership", "locations", "shapurNagar", "subhashNagar", "bahadurpally",
  "gallery", "resources", "bibleStudy", "media", "ngo", "ngoProjects",
  "ngoGallery", "ngoVideos", "ngoVolunteers", "contact", "give", "privacy", "terms"
];

for (const key of expectedPublicKeys) {
  const meta = (PAGE_METADATA as any)[key];
  assert(!!meta, `Metadata preset exists for '${key}'`);
  if (!meta) continue;

  const titleStr = typeof meta.title === "string" ? meta.title : "";
  const descStr = typeof meta.description === "string" ? meta.description : "";
  const canonical = meta.alternates?.canonical || "";

  assert(titleStr.length > 5, `[${key}] Title is present (${titleStr.length} chars)`);
  assert(!titles.has(titleStr), `[${key}] Title is globally unique: '${titleStr}'`);
  titles.add(titleStr);

  assert(descStr.length >= 50, `[${key}] Description has sufficient depth (${descStr.length} chars)`);
  assert(!descriptions.has(descStr), `[${key}] Description is globally unique`);
  descriptions.add(descStr);

  assert(typeof canonical === "string" && canonical.startsWith("https://kcmchurch.vercel.app"), `[${key}] Canonical uses production HTTPS (${canonical})`);
  assert(!paths.has(canonical), `[${key}] Canonical path is unique: '${canonical}'`);
  paths.add(canonical);

  assert(meta.openGraph?.title === titleStr, `[${key}] OpenGraph title matches page title`);
  assert(meta.openGraph?.url === canonical, `[${key}] OpenGraph URL matches canonical`);
  assert(meta.openGraph?.siteName === "Kingdom of Christ Ministries", `[${key}] OpenGraph siteName is canonical`);
  assert(meta.twitter?.card === "summary_large_image", `[${key}] Twitter card is summary_large_image`);
  assert(meta.robots?.index === true, `[${key}] Public page is indexable`);
}

// 5. Private Route Audit
console.log("\n── Private Route Security & Indexing Audit ──");
const privateKeys = ["login", "register", "forgotPassword"];
for (const key of privateKeys) {
  const meta = (PAGE_METADATA as any)[key];
  assert(!!meta, `Private metadata preset exists for '${key}'`);
  if (!meta) continue;
  assert(meta.robots?.index === false, `[${key}] Private page has index: false`);
  assert(meta.robots?.follow === false, `[${key}] Private page has follow: false`);
}

// 6. BreadcrumbList, VideoObject & Event Schemas
console.log("\n── Rich Snippet Schemas Verification ──");
const breadcrumbs = breadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Locations", url: `${SITE_URL}/locations` },
  { name: "Shapur Nagar", url: `${SITE_URL}/locations/shapur-nagar` },
]);
assert(breadcrumbs["@type"] === "BreadcrumbList", "BreadcrumbList schema type is BreadcrumbList");
assert(breadcrumbs.itemListElement.length === 3, "BreadcrumbList contains 3 levels");
assert(breadcrumbs.itemListElement[0].position === 1, "BreadcrumbList position 1 is Home");
assert(breadcrumbs.itemListElement[2].position === 3, "BreadcrumbList position 3 is Shapur Nagar");

const video = sermonVideoSchema({
  name: "Living by Faith Sermon",
  description: "Inspiring gospel sermon by Bishop Kurra Kristhu Raju",
  thumbnailUrl: `${SITE_URL}/pastor.png`,
  uploadDate: "2026-08-01",
  contentUrl: "https://youtube.com/watch?v=sample",
});
assert(video["@type"] === "VideoObject", "VideoObject schema type is VideoObject");
assert(video.publisher["@id"] === ORGANIZATION_ID, "Video publisher links to #organization");

const event = eventSchema({
  name: "Sunday Worship Gathering",
  description: "Weekly Sunday evening worship at Shapur Nagar Sanctuary",
  startDate: "2026-08-30T18:00:00+05:30",
  location: "Shapur Nagar Main Sanctuary, Jeedimetla, Hyderabad",
  eventUrl: `${SITE_URL}/events`,
});
assert(event["@type"] === "Event", "Event schema type is Event");
assert(event.organizer["@id"] === ORGANIZATION_ID, "Event organizer links to #organization");

console.log("\n=================================================");
if (failures === 0) {
  console.log("🎉 ALL 60+ TECHNICAL SEO & ENTITY QUALITY CHECKS PASSED!");
  console.log("=================================================");
  process.exit(0);
} else {
  console.error(`💥 AUDIT FAILED with ${failures} error(s)!`);
  console.log("=================================================");
  process.exit(1);
}
