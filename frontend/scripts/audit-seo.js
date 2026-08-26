/**
 * scripts/audit-seo.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Technical SEO & Schema.org Quality Gate for KCM Church Platform.
 * Run with: node frontend/scripts/audit-seo.js
 */

const fs = require("fs");
const path = require("path");

let failures = 0;

function assert(condition, msg) {
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

const SITE_URL = "https://kcmchurch.vercel.app";

// 1. Check lib/seo.ts file content
const seoFile = fs.readFileSync(path.join(__dirname, "../lib/seo.ts"), "utf8");
assert(seoFile.includes("https://kcmchurch.vercel.app"), "SITE_URL is production HTTPS in lib/seo.ts");

// 2. Check layout.tsx
const layoutFile = fs.readFileSync(path.join(__dirname, "../app/layout.tsx"), "utf8");
assert(layoutFile.includes("metadataBase: new URL(SITE_URL)"), "metadataBase is set to SITE_URL in layout.tsx");
assert(layoutFile.includes("canonical: SITE_URL"), "Root canonical is set in layout.tsx");
assert(layoutFile.includes("CrXIpIzuGUYxLQOuD16DJnLmUMafzisYdXY4LGzPHMw"), "GSC site verification token is preserved in layout.tsx");
assert(layoutFile.includes("<JsonLd data={[churchSchema(), websiteSchema()]} />"), "Global Church + WebSite Schema.org JSON-LD injected in layout.tsx");
assert(layoutFile.includes('<meta name="color-scheme" content="light dark" />'), "Samsung Internet color-scheme defense is present in layout.tsx");

// 3. Check sitemap.ts
const sitemapFile = fs.readFileSync(path.join(__dirname, "../app/sitemap.ts"), "utf8");
assert(!sitemapFile.includes('"/login"'), "Private /login is excluded from sitemap.ts");
assert(!sitemapFile.includes('"/register"'), "Private /register is excluded from sitemap.ts");
assert(!sitemapFile.includes('"/admin"'), "Private /admin is excluded from sitemap.ts");
assert(sitemapFile.includes('"/sermons"'), "/sermons is included in sitemap.ts");
assert(sitemapFile.includes('"/events"'), "/events is included in sitemap.ts");
assert(sitemapFile.includes('"/locations"'), "/locations is included in sitemap.ts");
assert(sitemapFile.includes('"/membership"'), "/membership is included in sitemap.ts");
assert(sitemapFile.includes('"/ngo"'), "/ngo is included in sitemap.ts");

// 4. Check robots.ts and public/robots.txt
const robotsTs = fs.readFileSync(path.join(__dirname, "../app/robots.ts"), "utf8");
const robotsTxt = fs.readFileSync(path.join(__dirname, "../public/robots.txt"), "utf8");
assert(robotsTs.includes("/admin"), "robots.ts disallows /admin");
assert(robotsTs.includes("/member"), "robots.ts disallows /member");
assert(robotsTs.includes("/pastor"), "robots.ts disallows /pastor");
assert(robotsTs.includes("/login"), "robots.ts disallows /login");
assert(robotsTs.includes("https://kcmchurch.vercel.app/sitemap.xml"), "robots.ts references sitemap.xml");

assert(robotsTxt.includes("Disallow: /admin"), "public/robots.txt disallows /admin");
assert(robotsTxt.includes("Disallow: /login"), "public/robots.txt disallows /login");
assert(robotsTxt.includes("Sitemap: https://kcmchurch.vercel.app/sitemap.xml"), "public/robots.txt references sitemap.xml");

// 5. Check schema.ts
const schemaFile = fs.readFileSync(path.join(__dirname, "../lib/schema.ts"), "utf8");
assert(schemaFile.includes('"Church"'), "schema.ts contains Church schema type");
assert(schemaFile.includes('"Kingdom of Christ Ministries"'), "schema.ts contains official church name");
assert(schemaFile.includes("17.5186"), "schema.ts contains verified latitude");
assert(schemaFile.includes("78.4487"), "schema.ts contains verified longitude");
assert(schemaFile.includes("500055"), "schema.ts contains verified postal code");
assert(schemaFile.includes('"Bishop Kurra Kristhu Raju"'), "schema.ts contains Senior Pastor founder");

// 6. Check middleware.ts for X-Robots-Tag
const middlewareFile = fs.readFileSync(path.join(__dirname, "../middleware.ts"), "utf8");
assert(middlewareFile.includes("res.headers.set('X-Robots-Tag', 'noindex, nofollow')"), "middleware.ts enforces X-Robots-Tag: noindex, nofollow on private paths");

// 7. Check All Public Layouts exist
const expectedLayouts = [
  "../app/sermons/layout.tsx",
  "../app/events/layout.tsx",
  "../app/prayer/layout.tsx",
  "../app/locations/layout.tsx",
  "../app/gallery/layout.tsx",
  "../app/membership/layout.tsx",
  "../app/about/story/layout.tsx",
  "../app/about/leadership/layout.tsx",
  "../app/about/beliefs/layout.tsx",
  "../app/about/ministries/layout.tsx",
  "../app/about/mission/layout.tsx",
  "../app/about/pastor-message/layout.tsx",
  "../app/get-involved/small-groups/layout.tsx",
  "../app/ngo/projects/layout.tsx",
  "../app/ngo/gallery/layout.tsx",
  "../app/ngo/videos/layout.tsx",
  "../app/ngo/volunteers/layout.tsx",
  "../app/contact/layout.tsx",
  "../app/give/layout.tsx",
  "../app/privacy/layout.tsx",
  "../app/terms/layout.tsx",
  "../app/login/layout.tsx",
  "../app/register/layout.tsx",
  "../app/forgot-password/layout.tsx"
];

for (const relPath of expectedLayouts) {
  const fullPath = path.join(__dirname, relPath);
  assert(fs.existsSync(fullPath), `Layout file exists: ${relPath}`);
}

console.log("\n=================================================");
if (failures === 0) {
  console.log("🎉 ALL 30-PHASE TECHNICAL SEO & QUALITY CHECKS PASSED!");
  console.log("=================================================");
  process.exit(0);
} else {
  console.error(`💥 AUDIT FAILED with ${failures} error(s)!`);
  console.log("=================================================");
  process.exit(1);
}
