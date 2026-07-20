import { prisma } from "@/lib/prisma";
import {
  HERO_FALLBACK,
  STATS_FALLBACK,
  ABOUT_FALLBACK,
  CONTACT_FALLBACK,
} from "@/hooks/useCmsData";

export async function getHeroContent() {
  try {
    const hero = await (prisma as any).homepageHero.findUnique({
      where: { id: "hero" },
    });
    return hero || HERO_FALLBACK;
  } catch (err) {
    console.error("[SERVER/CMS] getHeroContent error:", err);
    return HERO_FALLBACK;
  }
}

export async function getStatistics() {
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
}

export async function getAboutContent() {
  try {
    const about = await (prisma as any).aboutConfig.findUnique({
      where: { id: "about" },
    });
    return about || ABOUT_FALLBACK;
  } catch (err) {
    console.error("[SERVER/CMS] getAboutContent error:", err);
    return ABOUT_FALLBACK;
  }
}

export async function getContacts() {
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
}

export async function getPastors() {
  try {
    const pastors = await (prisma as any).pastor.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return pastors;
  } catch (err) {
    console.error("[SERVER/CMS] getPastors error:", err);
    return [];
  }
}

export async function getServices() {
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
}

export async function getEvents() {
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
}
