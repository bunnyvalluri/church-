import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  HERO_FALLBACK,
  STATS_FALLBACK,
  ABOUT_FALLBACK,
  CONTACT_FALLBACK,
} from "@/hooks/useCmsData";

// ── Cache TTL: 5 minutes for all CMS content ────────────────────────────────
// Cached results are served instantly without hitting the DB on every request.
const CACHE_TTL = 300; // seconds

/**
 * Safeguard database queries with a strict timeout to prevent cold Neon connections
 * or unhandled query locks from hanging server-side rendering.
 */
async function withTimeout<T>(promise: Promise<T>, ms = 4000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[SERVER/CMS] Query timed out after ${ms}ms, returning fallback.`);
      resolve(fallback);
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (err) {
    console.error("[SERVER/CMS] Query exception:", err);
    return fallback;
  } finally {
    clearTimeout(timer!);
  }
}

export const getHeroContent = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).homepageHero
        .findUnique({ where: { id: "hero" } })
        .then((hero: any) => hero || HERO_FALLBACK),
      4000,
      HERO_FALLBACK
    );
  },
  ["cms-hero"],
  { revalidate: CACHE_TTL, tags: ["cms-hero"] }
);

export const getStatistics = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).siteStatistic
        .findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        })
        .then((stats: any) => (stats?.length > 0 ? stats : STATS_FALLBACK)),
      4000,
      STATS_FALLBACK
    );
  },
  ["cms-statistics"],
  { revalidate: CACHE_TTL, tags: ["cms-statistics"] }
);

export const getAboutContent = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).aboutConfig
        .findUnique({ where: { id: "about" } })
        .then((about: any) => about || ABOUT_FALLBACK),
      4000,
      ABOUT_FALLBACK
    );
  },
  ["cms-about"],
  { revalidate: CACHE_TTL, tags: ["cms-about"] }
);

export const getContacts = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).siteContact
        .findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        })
        .then((contacts: any) => (contacts?.length > 0 ? contacts : CONTACT_FALLBACK)),
      4000,
      CONTACT_FALLBACK
    );
  },
  ["cms-contacts"],
  { revalidate: CACHE_TTL, tags: ["cms-contacts"] }
);

export const getPastors = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).pastor
        .findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        })
        .then((pastors: any) => pastors || []),
      4000,
      []
    );
  },
  ["cms-pastors"],
  { revalidate: CACHE_TTL, tags: ["cms-pastors"] }
);

export const getServices = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).churchService
        .findMany({
          where: { status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
          include: {
            branch: { select: { id: true, name: true } },
          },
        })
        .then((services: any) => services || []),
      4000,
      []
    );
  },
  ["cms-services"],
  { revalidate: CACHE_TTL, tags: ["cms-services"] }
);

export const getEvents = unstable_cache(
  async () => {
    return withTimeout(
      (prisma as any).event
        .findMany({
          where: {
            status: "PUBLISHED",
            date: { gte: new Date() },
          },
          orderBy: { date: "asc" },
          take: 6,
          include: {
            branch: { select: { name: true } },
          },
        })
        .then((events: any) => events || []),
      4000,
      []
    );
  },
  ["cms-events"],
  { revalidate: CACHE_TTL, tags: ["cms-events"] }
);
