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

export const getHeroContent = unstable_cache(
  async () => {
    try {
      const hero = await (prisma as any).homepageHero.findUnique({
        where: { id: "hero" },
      });
      return hero || HERO_FALLBACK;
    } catch (err) {
      console.error("[SERVER/CMS] getHeroContent error:", err);
      return HERO_FALLBACK;
    }
  },
  ["cms-hero"],
  { revalidate: CACHE_TTL, tags: ["cms-hero"] }
);

export const getStatistics = unstable_cache(
  async () => {
    try {
      const stats = await (prisma as any).siteStatistic.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      });
      return stats.length > 0 ? stats : STATS_FALLBACK;
    } catch (err) {
      console.error("[SERVER/CMS] getStatistics error:", err);
      return STATS_FALLBACK;
    }
  },
  ["cms-statistics"],
  { revalidate: CACHE_TTL, tags: ["cms-statistics"] }
);

export const getAboutContent = unstable_cache(
  async () => {
    try {
      const about = await (prisma as any).aboutConfig.findUnique({
        where: { id: "about" },
      });
      return about || ABOUT_FALLBACK;
    } catch (err) {
      console.error("[SERVER/CMS] getAboutContent error:", err);
      return ABOUT_FALLBACK;
    }
  },
  ["cms-about"],
  { revalidate: CACHE_TTL, tags: ["cms-about"] }
);

export const getContacts = unstable_cache(
  async () => {
    try {
      const contacts = await (prisma as any).siteContact.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      });
      return contacts.length > 0 ? contacts : CONTACT_FALLBACK;
    } catch (err) {
      console.error("[SERVER/CMS] getContacts error:", err);
      return CONTACT_FALLBACK;
    }
  },
  ["cms-contacts"],
  { revalidate: CACHE_TTL, tags: ["cms-contacts"] }
);

export const getPastors = unstable_cache(
  async () => {
    try {
      const pastors = await (prisma as any).pastor.findMany({
        orderBy: { displayOrder: "asc" },
      });
      return pastors;
    } catch (err) {
      console.error("[SERVER/CMS] getPastors error:", err);
      return [];
    }
  },
  ["cms-pastors"],
  { revalidate: CACHE_TTL, tags: ["cms-pastors"] }
);

export const getServices = unstable_cache(
  async () => {
    try {
      const services = await (prisma as any).churchService.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        include: {
          branch: { select: { id: true, name: true } },
        },
      });
      return services;
    } catch (err) {
      console.error("[SERVER/CMS] getServices error:", err);
      return [];
    }
  },
  ["cms-services"],
  { revalidate: CACHE_TTL, tags: ["cms-services"] }
);

export const getEvents = unstable_cache(
  async () => {
    try {
      const events = await (prisma as any).event.findMany({
        where: {
          status: "PUBLISHED",
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
        take: 6,
        include: {
          branch: { select: { name: true } },
        },
      });
      return events;
    } catch (err) {
      console.error("[SERVER/CMS] getEvents error:", err);
      return [];
    }
  },
  ["cms-events"],
  { revalidate: CACHE_TTL, tags: ["cms-events"] }
);

