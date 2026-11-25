/**
 * scripts/ping-search-engines.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Verifies live Google Search Console prerequisites (verification file, meta tag,
 * sitemap.xml, image-sitemap.xml, robots.txt, edge cache TTFB) and pushes all
 * live sitemap URLs to IndexNow for instant search engine crawling.
 *
 * Usage: node scripts/ping-search-engines.js
 */
const https = require("https");

const HOST = "kcmchurch.vercel.app";
const BASE_URL = `https://${HOST}`;
const INDEXNOW_KEY = "kcm-indexnow-2026";
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({
            url,
            status: res.statusCode,
            ms: Date.now() - start,
            cache: res.headers["x-vercel-cache"] || res.headers["cache-control"] || "",
            body: data,
          })
        );
      })
      .on("error", reject);
  });
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("=== KCM Search Console & Indexing Readiness Check ===");

  const endpoints = [
    `${BASE_URL}/`,
    `${BASE_URL}/robots.txt`,
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/image-sitemap.xml`,
    `${BASE_URL}/google1c189b696b891a6b.html`,
    KEY_LOCATION,
  ];

  const results = await Promise.all(endpoints.map((u) => fetchText(u).catch((e) => ({ url: u, status: 0, error: e.message }))));
  let sitemapXml = "";

  for (const r of results) {
    const ok = r.status === 200;
    console.log(`${ok ? "PASS" : "FAIL"} [${r.status}] ${r.url} (${r.ms ?? "-"}ms, ${r.body ? r.body.length + "B" : r.error || ""})`);
    if (r.url.endsWith("/sitemap.xml") && r.body) {
      sitemapXml = r.body;
    }
    if (r.url === `${BASE_URL}/` && r.body) {
      const hasMeta = r.body.includes("CrXIpIzuGUYxLQOuD16DJnLmUMafzisYdXY4LGzPHMw");
      const hasOpacityZeroHero = r.body.includes('class="max-w-5xl mx-auto text-center" style="opacity:0"');
      console.log(`  GSC meta tag present: ${hasMeta} | Hero SSR opacity:0 bug present: ${hasOpacityZeroHero}`);
    }
  }

  const locMatches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  console.log(`\nDiscovered ${locMatches.length} canonical URL(s) in sitemap.xml.`);

  if (locMatches.length > 0 && results.find((r) => r.url === KEY_LOCATION)?.status === 200) {
    console.log("Submitting URLs to IndexNow (Bing/Yandex/AI Search)...");
    const resp = await postJson("https://api.indexnow.org/indexnow", {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: locMatches,
    });
    console.log(`IndexNow response: HTTP ${resp.status} ${resp.body || "(Accepted)"}`);
  } else {
    console.log("Skipping IndexNow submission until verification key is deployed live.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
