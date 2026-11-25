import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { NGO_PRESETS } from "@/lib/ngoPresets";

// Cache sitemap at Vercel Edge CDN for 1 hour with background ISR refresh (<30ms TTFB)
export const revalidate = 3600;

const BASE_URL = "https://kcmchurch.vercel.app";
const DEFAULT_UPDATED = new Date("2026-11-25T00:00:00Z");

async function fetchDynamicSeoSignals() {
  const timeout = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
    Promise.race([
      p.catch(() => fallback),
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 1500)),
    ]);

  const [latestEvent, latestSermon, latestGallery, ngoProjects] = await Promise.all([
    timeout<{ updatedAt: Date } | null>(
      (prisma as any).event.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      null
    ),
    timeout<{ updatedAt: Date } | null>(
      (prisma as any).sermon.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      null
    ),
    timeout<{ updatedAt: Date } | null>(
      (prisma as any).gallery.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      null
    ),
    timeout<Array<{ id: string; updatedAt: Date }>>(
      (prisma as any).ngoProject.findMany({
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        select: { id: true, updatedAt: true },
        take: 50,
      }),
      []
    ),
  ]);

  return {
    latestEventAt: latestEvent?.updatedAt ? new Date(latestEvent.updatedAt) : DEFAULT_UPDATED,
    latestSermonAt: latestSermon?.updatedAt ? new Date(latestSermon.updatedAt) : DEFAULT_UPDATED,
    latestGalleryAt: latestGallery?.updatedAt ? new Date(latestGallery.updatedAt) : DEFAULT_UPDATED,
    ngoProjects: Array.isArray(ngoProjects) ? ngoProjects : [],
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { latestEventAt, latestSermonAt, latestGalleryAt, ngoProjects } =
    await fetchDynamicSeoSignals();

  const entries: MetadataRoute.Sitemap = [
    // ── Core pages ────────────────────────────────────────────────────────────
    { url: `${BASE_URL}/`,                          priority: 1.0, changeFrequency: "weekly",  lastModified: DEFAULT_UPDATED },

    // ── About ─────────────────────────────────────────────────────────────────
    { url: `${BASE_URL}/about`,                     priority: 0.9, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/about/story`,               priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/about/leadership`,          priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/about/beliefs`,             priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-09-01") },
    { url: `${BASE_URL}/about/ministries`,          priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/about/mission`,             priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-09-01") },
    { url: `${BASE_URL}/about/pastor-message`,      priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },

    // ── High-traffic / dynamic church feeds ───────────────────────────────────
    { url: `${BASE_URL}/sermons`,                   priority: 0.9, changeFrequency: "weekly",  lastModified: latestSermonAt },
    { url: `${BASE_URL}/events`,                    priority: 0.9, changeFrequency: "daily",   lastModified: latestEventAt },
    { url: `${BASE_URL}/prayer`,                    priority: 0.8, changeFrequency: "weekly",  lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/gallery`,                   priority: 0.8, changeFrequency: "weekly",  lastModified: latestGalleryAt },

    // ── Get Involved ──────────────────────────────────────────────────────────
    { url: `${BASE_URL}/get-involved`,              priority: 0.8, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/get-involved/small-groups`, priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/get-involved/volunteer`,    priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/get-involved/serve`,        priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },

    // ── Membership ────────────────────────────────────────────────────────────
    { url: `${BASE_URL}/membership`,                priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-10-15") },

    // ── Locations ─────────────────────────────────────────────────────────────
    { url: `${BASE_URL}/locations`,                 priority: 0.9, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/locations/shapur-nagar`,    priority: 0.8, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/locations/subhash-nagar`,   priority: 0.8, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/locations/bahadurpally`,    priority: 0.8, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },

    // ── Resources ─────────────────────────────────────────────────────────────
    { url: `${BASE_URL}/resources`,                 priority: 0.7, changeFrequency: "weekly",  lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/resources/bible-study`,     priority: 0.7, changeFrequency: "weekly",  lastModified: new Date("2026-10-15") },
    { url: `${BASE_URL}/resources/media`,           priority: 0.6, changeFrequency: "weekly",  lastModified: new Date("2026-10-15") },

    // ── NGO / Outreach & Giving ───────────────────────────────────────────────
    { url: `${BASE_URL}/ngo`,                       priority: 0.8, changeFrequency: "weekly",  lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/ngo/projects`,              priority: 0.8, changeFrequency: "weekly",  lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/ngo/donations`,             priority: 0.8, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/ngo/gallery`,               priority: 0.7, changeFrequency: "weekly",  lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/ngo/videos`,                priority: 0.6, changeFrequency: "weekly",  lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/ngo/volunteers`,            priority: 0.6, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },

    // ── Contact & Legal ───────────────────────────────────────────────────────
    { url: `${BASE_URL}/contact`,                   priority: 0.7, changeFrequency: "monthly", lastModified: DEFAULT_UPDATED },
    { url: `${BASE_URL}/privacy`,                   priority: 0.3, changeFrequency: "yearly",  lastModified: new Date("2026-01-01") },
    { url: `${BASE_URL}/terms`,                     priority: 0.3, changeFrequency: "yearly",  lastModified: new Date("2026-01-01") },
  ];

  // Add canonical preset NGO initiative detail pages
  const seenUrls = new Set(entries.map((e) => e.url));
  for (const preset of Object.values(NGO_PRESETS)) {
    const url = `${BASE_URL}/ngo/projects/${preset.id}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        priority: 0.7,
        changeFrequency: "monthly",
        lastModified: preset.createdAt ? new Date(preset.createdAt) : DEFAULT_UPDATED,
      });
    }
  }

  // Add dynamic DB-created NGO projects
  for (const proj of ngoProjects) {
    const url = `${BASE_URL}/ngo/projects/${proj.id}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      entries.push({
        url,
        priority: 0.7,
        changeFrequency: "weekly",
        lastModified: proj.updatedAt ? new Date(proj.updatedAt) : DEFAULT_UPDATED,
      });
    }
  }

  return entries;
}
